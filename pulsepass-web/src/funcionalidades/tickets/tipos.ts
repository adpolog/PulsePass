import { z } from 'zod'
import { DecimalSchema, FechaHoraLocalSchema } from '../../lib/esquemas'

// ─── Enumeraciones (PRD §10.1) ───────────────────────────────────────────────

export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export type TicketType = z.infer<typeof TicketTypeSchema>

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketStatus = z.infer<typeof TicketStatusSchema>

// ─── Respuestas ──────────────────────────────────────────────────────────────

/**
 * TicketResponse (backend: dto/response/TicketResponse.java).
 * Nota de contrato: el titular se identifica solo por `userEmail` (no hay nombre).
 */
export const TicketResponseSchema = z.object({
  id: z.number().int(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  price: DecimalSchema,
  status: TicketStatusSchema,
  purchaseDate: FechaHoraLocalSchema,
  userEmail: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
})
export type TicketResponse = z.infer<typeof TicketResponseSchema>

export const ListaTicketsSchema = z.array(TicketResponseSchema)

// ─── Solicitudes ─────────────────────────────────────────────────────────────

/** PurchaseTicketRequest — `userEmail` sale SIEMPRE de la sesión, nunca de un campo. */
export const PurchaseTicketRequestSchema = z.object({
  userEmail: z.email(),
  eventCode: z.string().min(1),
  type: TicketTypeSchema,
})
export type PurchaseTicketRequest = z.infer<typeof PurchaseTicketRequestSchema>

/** Formulario del panel de compra: solo se elige el tipo. */
export const FormularioCompraSchema = z.object({
  type: TicketTypeSchema,
})
export type FormularioCompra = z.infer<typeof FormularioCompraSchema>

/** Validación de ingreso (STAFF). */
export const BuscarTicketSchema = z.object({
  ticketCode: z.string().trim().min(1, 'Ingresa el código del ticket'),
})
export type BuscarTicket = z.infer<typeof BuscarTicketSchema>
