import { http } from '../../lib/http'
import { TicketResponseSchema, type PurchaseTicketRequest } from './types'

export function purchaseTicket(data: PurchaseTicketRequest) {
  return http.post('/tickets', TicketResponseSchema, data)
}
