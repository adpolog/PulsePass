import { z } from 'zod'

/**
 * Esquemas primitivos compartidos por los `tipos.ts` de cada funcionalidad.
 * Reflejan cómo Jackson serializa los tipos Java del backend.
 */

/** `LocalDateTime` → "2026-12-12T20:00:00" (sin zona horaria). */
export const FechaHoraLocalSchema = z.iso.datetime({ local: true })

/** `LocalDate` → "1998-04-12". */
export const FechaLocalSchema = z.iso.date()

/** `BigDecimal` → número JSON (se acepta también texto numérico por robustez). */
export const DecimalSchema = z.coerce.number().refine(Number.isFinite, 'Número inválido')

/** Lista que el backend podría enviar como `null`; se normaliza a `[]`. */
export function listaSegura<T extends z.ZodType>(item: T) {
  return z
    .array(item)
    .nullish()
    .transform((lista) => lista ?? [])
}
