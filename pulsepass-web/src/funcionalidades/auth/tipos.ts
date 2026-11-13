import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

export const LoginRequestSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

// expiresIn llega en segundos.
export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

// El backend envía "ROLE_USER", "ROLE_ADMIN"…; se dejan como "USER", "ADMIN".
const RolesSchema = z.array(z.string()).transform((roles) =>
  roles
    .map((r) => r.replace(/^ROLE_/, ''))
    .filter((r): r is Rol => RolSchema.safeParse(r).success),
)

export const UsuarioAutenticadoSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  roles: RolesSchema,
})
export type UsuarioAutenticado = z.infer<typeof UsuarioAutenticadoSchema>

// Lo que se guarda en sessionStorage (se valida al leerlo).
export const SesionGuardadaSchema = z.object({
  token: z.string().min(1),
  expiraEn: z.number(),
})
export type SesionGuardada = z.infer<typeof SesionGuardadaSchema>

export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo'; motivo?: 'expirada' }
  | { estado: 'autenticado'; token: string; expiraEn: number; usuario: UsuarioAutenticado }
