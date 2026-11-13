import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

// ─── Login ───────────────────────────────────────────────────────────────────

export const LoginRequestSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

/** AuthResponse (backend: dto/response/AuthResponse.java). `expiresIn` en segundos. */
export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

// ─── Usuario autenticado (/api/auth/me) ──────────────────────────────────────

/**
 * El backend entrega las authorities de Spring ("ROLE_USER", "ROLE_ADMIN"…).
 * Se normalizan a los roles del dominio y se descartan valores desconocidos.
 */
const RolesSchema = z.array(z.string()).transform((roles) =>
  roles
    .map((r) => r.replace(/^ROLE_/, ''))
    .filter((r): r is Rol => RolSchema.safeParse(r).success),
)

/** AuthenticatedUserResponse (backend: dto/response/AuthenticatedUserResponse.java). */
export const UsuarioAutenticadoSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  roles: RolesSchema,
})
export type UsuarioAutenticado = z.infer<typeof UsuarioAutenticadoSchema>
