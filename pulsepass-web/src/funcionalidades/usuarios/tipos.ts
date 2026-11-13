import { z } from 'zod'

/**
 * UserResponse (backend: dto/response/UserResponse.java).
 * Nota de contrato: NO incluye `birthDate` (el PRD lo asumía en "Mi cuenta").
 */
export const UserResponseSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  active: z.boolean(),
})
export type UserResponse = z.infer<typeof UserResponseSchema>

// ─── Registro (PRD §9.9, §11) ────────────────────────────────────────────────

const MAX_BYTES_CONTRASENA = 72

function bytesUtf8(texto: string): number {
  return new TextEncoder().encode(texto).length
}

/** Fecha "YYYY-MM-DD" de hoy en hora local (comparable como texto). */
function hoyIso(): string {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

/**
 * RegisterUserRequest. `phone` y `city` son opcionales en el backend y la vista
 * de registro no los pide, así que no se envían.
 * La edad mínima NO se valida aquí: es regla de negocio por evento (backend).
 */
export const RegisterUserRequestSchema = z.object({
  username: z.string().trim().min(1, 'Ingresa un nombre de usuario'),
  email: z.email('Ingresa un correo válido'),
  firstName: z.string().trim().min(1, 'Ingresa tus nombres'),
  lastName: z.string().trim().min(1, 'Ingresa tus apellidos'),
  birthDate: z.iso
    .date('Ingresa tu fecha de nacimiento')
    .refine((fecha) => fecha <= hoyIso(), 'La fecha no puede ser futura'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .refine((p) => bytesUtf8(p) <= MAX_BYTES_CONTRASENA, 'La contraseña no puede superar 72 bytes'),
})
export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>
