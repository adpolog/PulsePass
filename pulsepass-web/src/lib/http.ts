import { z } from 'zod'

/**
 * Cliente HTTP base de PulsePass (PRD §5, §12.2, §13).
 *
 *  - fetch nativo, sin Axios.
 *  - El token viaja SOLO en `Authorization: Bearer <token>` (FE-013); nunca en la URL ni en consola.
 *  - Toda respuesta no exitosa se convierte en `ApiError` validando `ErrorResponse` con zod.
 *  - Toda respuesta exitosa se valida con el esquema zod que entrega el `api.ts` de cada funcionalidad.
 *  - Un 401 en una petición que llevaba token se interpreta como sesión expirada y notifica a AuthContext.
 */

// ─── Contrato de error del backend (Fase 3) ──────────────────────────────────

export const ErrorResponseSchema = z.object({
  // LocalDateTime: no se usa en la UI, se acepta sin imponer formato.
  timestamp: z.unknown().optional(),
  status: z.number().int(),
  error: z.string().optional(),
  message: z.string(),
  details: z
    .record(z.string(), z.string())
    .nullish()
    .transform((d) => d ?? {}),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ─── ApiError ────────────────────────────────────────────────────────────────

/**
 * - `red`:      no hubo respuesta (servidor caído, sin conexión). `status = 0`.
 * - `http`:     el servidor respondió con un código ≠ 2xx.
 * - `contrato`: respuesta 2xx cuyo cuerpo no cumple el esquema esperado.
 */
export type TipoApiError = 'red' | 'http' | 'contrato'

export const MENSAJE_RED = 'No pudimos conectar con el servidor.'
export const MENSAJE_GENERICO = 'Ocurrió un error inesperado. Inténtalo más tarde.'

export class ApiError extends Error {
  readonly status: number
  readonly details: Record<string, string>
  readonly tipo: TipoApiError

  constructor(
    status: number,
    message: string,
    details: Record<string, string> = {},
    tipo: TipoApiError = 'http',
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.tipo = tipo
  }
}

export function esApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// ─── Integración con la sesión (la registra AuthContext) ─────────────────────

interface ConfiguracionHttp {
  /** Devuelve el token vigente o `null` si no hay sesión. */
  obtenerToken: () => string | null
  /** Se invoca cuando una petición autenticada recibe 401 (token vencido o manipulado). */
  alNoAutorizado: () => void
}

let configuracion: ConfiguracionHttp = {
  obtenerToken: () => null,
  alNoAutorizado: () => {},
}

export function configurarHttp(nueva: ConfiguracionHttp): void {
  configuracion = nueva
}

// ─── Petición base ───────────────────────────────────────────────────────────

const URL_BASE: string = import.meta.env.VITE_API_BASE_URL ?? '/api'

type Metodo = 'GET' | 'POST' | 'PATCH'
type ParametrosConsulta = Record<string, string | number | undefined>

interface OpcionesPeticion {
  metodo?: Metodo
  cuerpo?: unknown
  params?: ParametrosConsulta
  signal?: AbortSignal
}

function construirUrl(ruta: string, params?: ParametrosConsulta): string {
  const url = `${URL_BASE}${ruta}`
  if (!params) return url
  const consulta = new URLSearchParams()
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined) consulta.set(clave, String(valor))
  }
  const texto = consulta.toString()
  return texto ? `${url}?${texto}` : url
}

async function leerJson(respuesta: Response): Promise<unknown> {
  const texto = await respuesta.text()
  if (!texto) return undefined
  try {
    return JSON.parse(texto) as unknown
  } catch {
    return undefined
  }
}

async function aApiError(respuesta: Response): Promise<ApiError> {
  const resultado = ErrorResponseSchema.safeParse(await leerJson(respuesta))
  if (!resultado.success) {
    return new ApiError(respuesta.status, MENSAJE_GENERICO)
  }
  return new ApiError(respuesta.status, resultado.data.message, resultado.data.details)
}

export async function peticion<T>(
  ruta: string,
  esquema: z.ZodType<T>,
  { metodo = 'GET', cuerpo, params, signal }: OpcionesPeticion = {},
): Promise<T> {
  const token = configuracion.obtenerToken()

  const encabezados = new Headers({ Accept: 'application/json' })
  if (cuerpo !== undefined) encabezados.set('Content-Type', 'application/json')
  if (token) encabezados.set('Authorization', `Bearer ${token}`)

  let respuesta: Response
  try {
    respuesta = await fetch(construirUrl(ruta, params), {
      method: metodo,
      headers: encabezados,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal,
    })
  } catch (error: unknown) {
    // Las cancelaciones de TanStack Query no son errores de red.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, MENSAJE_RED, {}, 'red')
  }

  if (!respuesta.ok) {
    // 401 con token enviado = sesión expirada. El 401 del login (sin token) lo maneja la pantalla.
    if (respuesta.status === 401 && token) configuracion.alNoAutorizado()
    throw await aApiError(respuesta)
  }

  const resultado = esquema.safeParse(await leerJson(respuesta))
  if (!resultado.success) {
    throw new ApiError(respuesta.status, MENSAJE_GENERICO, {}, 'contrato')
  }
  return resultado.data
}

// ─── Atajos por método ───────────────────────────────────────────────────────

type OpcionesSinMetodo = Omit<OpcionesPeticion, 'metodo' | 'cuerpo'>

export const http = {
  get: <T>(ruta: string, esquema: z.ZodType<T>, opciones?: OpcionesSinMetodo) =>
    peticion(ruta, esquema, { ...opciones, metodo: 'GET' }),

  post: <T>(ruta: string, esquema: z.ZodType<T>, cuerpo?: unknown, opciones?: OpcionesSinMetodo) =>
    peticion(ruta, esquema, { ...opciones, metodo: 'POST', cuerpo }),

  patch: <T>(ruta: string, esquema: z.ZodType<T>, cuerpo?: unknown, opciones?: OpcionesSinMetodo) =>
    peticion(ruta, esquema, { ...opciones, metodo: 'PATCH', cuerpo }),
}
