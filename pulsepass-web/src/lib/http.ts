import { z } from 'zod'

export const ErrorResponseSchema = z.object({
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

// network: no response · http: non-2xx status · contract: 2xx body that fails the schema
export type ApiErrorKind = 'network' | 'http' | 'contract'

export const NETWORK_MESSAGE = 'No pudimos conectar con el servidor.'
export const GENERIC_MESSAGE = 'Ocurrió un error inesperado. Inténtalo más tarde.'

export class ApiError extends Error {
  readonly status: number
  readonly details: Record<string, string>
  readonly kind: ApiErrorKind

  constructor(
    status: number,
    message: string,
    details: Record<string, string> = {},
    kind: ApiErrorKind = 'http',
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.kind = kind
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// In-memory token and 401 handler, both set by AuthContext.
let authToken: string | null = null
let unauthorizedHandler: () => void = () => {}

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler
}

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api'

type Method = 'GET' | 'POST' | 'PATCH'
type QueryParams = Record<string, string | number | undefined>

interface RequestOptions {
  method?: Method
  body?: unknown
  params?: QueryParams
  signal?: AbortSignal
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = `${BASE_URL}${path}`
  if (!params) return url
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  const text = query.toString()
  return text ? `${url}?${text}` : url
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const result = ErrorResponseSchema.safeParse(await readJson(response))
  if (!result.success) return new ApiError(response.status, GENERIC_MESSAGE)
  return new ApiError(response.status, result.data.message, result.data.details)
}

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  { method = 'GET', body, params, signal }: RequestOptions = {},
): Promise<T> {
  const token = authToken
  const headers = new Headers({ Accept: 'application/json' })
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error: unknown) {
    // TanStack Query cancellations are not network errors.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, NETWORK_MESSAGE, {}, 'network')
  }

  if (!response.ok) {
    // 401 with a token means the session expired; a 401 on login (no token) is handled by the page.
    if (response.status === 401 && token) unauthorizedHandler()
    throw await toApiError(response)
  }

  const result = schema.safeParse(await readJson(response))
  if (!result.success) throw new ApiError(response.status, GENERIC_MESSAGE, {}, 'contract')
  return result.data
}

type ShortOptions = Omit<RequestOptions, 'method' | 'body'>

export const http = {
  get: <T>(path: string, schema: z.ZodType<T>, options?: ShortOptions) =>
    request(path, schema, { ...options, method: 'GET' }),
  post: <T>(path: string, schema: z.ZodType<T>, body?: unknown, options?: ShortOptions) =>
    request(path, schema, { ...options, method: 'POST', body }),
  patch: <T>(path: string, schema: z.ZodType<T>, body?: unknown, options?: ShortOptions) =>
    request(path, schema, { ...options, method: 'PATCH', body }),
}
