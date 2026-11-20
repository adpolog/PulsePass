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

// STAFF/ADMIN: check-in at the door.
export function markTicketUsed(ticketCode: string) {
  return http.patch(`${ticketPath(ticketCode)}/use`, TicketResponseSchema)
}

// STAFF/ADMIN: PAID tickets of an event.
export function getPaidTicketsByEvent(eventCode: string, signal?: AbortSignal) {
  return http.get(`/events/${encodeURIComponent(eventCode)}/tickets/paid`, TicketListSchema, { signal })
}
