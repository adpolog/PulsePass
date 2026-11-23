import { z } from 'zod'
import { LocalDateSchema } from '../../lib/schemas'

export const UserResponseSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  active: z.boolean(),
  birthDate: LocalDateSchema.nullable(),
})
export type UserResponse = z.infer<typeof UserResponseSchema>

const MAX_PASSWORD_BYTES = 72

function utf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length
}

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Minimum age is not checked here: it is a backend business rule.
export const RegisterUserRequestSchema = z.object({
  username: z.string().trim().min(1, 'Ingresa un nombre de usuario'),
  email: z.email('Ingresa un correo válido'),
  firstName: z.string().trim().min(1, 'Ingresa tus nombres'),
  lastName: z.string().trim().min(1, 'Ingresa tus apellidos'),
  birthDate: z.iso
    .date('Ingresa tu fecha de nacimiento')
    .refine((date) => date <= todayIso(), 'La fecha no puede ser futura'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .refine((p) => utf8Bytes(p) <= MAX_PASSWORD_BYTES, 'La contraseña no puede superar 72 bytes'),
})
export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>
