import { z } from 'zod'

export const RoleSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Role = z.infer<typeof RoleSchema>

export const LoginRequestSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

// expiresIn is in seconds.
export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

// The backend sends "ROLE_USER", "ROLE_ADMIN"…; they become "USER", "ADMIN".
const RolesSchema = z.array(z.string()).transform((roles) =>
  roles
    .map((r) => r.replace(/^ROLE_/, ''))
    .filter((r): r is Role => RoleSchema.safeParse(r).success),
)

export const AuthenticatedUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  roles: RolesSchema,
})
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>

export const StoredSessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.number(),
})
export type StoredSession = z.infer<typeof StoredSessionSchema>

export type Session =
  | { status: 'loading' }
  | { status: 'anonymous'; reason?: 'expired' }
  | { status: 'authenticated'; token: string; expiresAt: number; user: AuthenticatedUser }
