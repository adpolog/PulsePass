import { z } from 'zod'
import { DecimalSchema, LocalDateTimeSchema } from '../../lib/schemas'

export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export type TicketType = z.infer<typeof TicketTypeSchema>

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketStatus = z.infer<typeof TicketStatusSchema>

export const TicketResponseSchema = z.object({
  id: z.number().int(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  price: DecimalSchema,
  status: TicketStatusSchema,
  purchaseDate: LocalDateTimeSchema,
  userEmail: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
  holderName: z.string().nullable(),
})
export type TicketResponse = z.infer<typeof TicketResponseSchema>

export const TicketListSchema = z.array(TicketResponseSchema)

// userEmail always comes from the session, never from a form field.
export const PurchaseTicketRequestSchema = z.object({
  userEmail: z.email(),
  eventCode: z.string().min(1),
  type: TicketTypeSchema,
})
export type PurchaseTicketRequest = z.infer<typeof PurchaseTicketRequestSchema>

export const PurchaseFormSchema = z.object({
  type: TicketTypeSchema,
})
export type PurchaseForm = z.infer<typeof PurchaseFormSchema>

export const TicketLookupSchema = z.object({
  ticketCode: z.string().trim().min(1, 'Ingresa el código del ticket'),
})
export type TicketLookup = z.infer<typeof TicketLookupSchema>
