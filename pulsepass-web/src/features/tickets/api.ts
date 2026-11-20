import { http } from '../../lib/http'
import { TicketListSchema, TicketResponseSchema, type PurchaseTicketRequest } from './types'

const ticketPath = (ticketCode: string) => `/tickets/${encodeURIComponent(ticketCode)}`

export function purchaseTicket(data: PurchaseTicketRequest) {
  return http.post('/tickets', TicketResponseSchema, data)
}

export function getTicket(ticketCode: string, signal?: AbortSignal) {
  return http.get(ticketPath(ticketCode), TicketResponseSchema, { signal })
}

// GAP-03: there is no "tickets by user id"; the email comes from /api/auth/me.
export function getTicketsByUser(email: string, signal?: AbortSignal) {
  return http.get('/tickets/by-user', TicketListSchema, { params: { email }, signal })
}

export function cancelTicket(ticketCode: string) {
  return http.patch(`${ticketPath(ticketCode)}/cancel`, TicketResponseSchema)
}
