import { z } from 'zod'

// Java LocalDateTime → "2026-12-12T20:00:00" (no time zone).
export const LocalDateTimeSchema = z.iso.datetime({ local: true })

// Java LocalDate → "1998-04-12".
export const LocalDateSchema = z.iso.date()

// Java BigDecimal → JSON number (numeric strings are accepted too).
export const DecimalSchema = z.coerce.number().refine(Number.isFinite, 'Número inválido')

// A list the backend might send as null is normalized to [].
export function safeList<T extends z.ZodType>(item: T) {
  return z
    .array(item)
    .nullish()
    .transform((list) => list ?? [])
}
