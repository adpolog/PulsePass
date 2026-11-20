import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelTicket, getTicket, getTicketsByUser, purchaseTicket } from './api'
import type { PurchaseTicketRequest, TicketResponse } from './types'

// Query keys in one place so queries and invalidations cannot drift apart (PRD §14.1).
export const ticketKeys = {
  byUser: (email: string) => ['tickets', 'user', email] as const,
  detail: (ticketCode: string) => ['ticket', ticketCode] as const,
  paidByEvent: (eventCode: string) => ['tickets', 'paid', eventCode] as const,
}

export function useMyTickets(email: string) {
  return useQuery({
    queryKey: ticketKeys.byUser(email),
    queryFn: ({ signal }) => getTicketsByUser(email, signal),
    staleTime: 15_000,
  })
}

export function useTicket(ticketCode: string) {
  return useQuery({
    queryKey: ticketKeys.detail(ticketCode),
    queryFn: ({ signal }) => getTicket(ticketCode, signal),
    staleTime: 15_000,
  })
}

export function useBuyTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PurchaseTicketRequest) => purchaseTicket(data),
    onSuccess: (ticket) => {
      // The new ticket is seeded so the confirmation page does not need a second request.
      queryClient.setQueryData(ticketKeys.detail(ticket.ticketCode), ticket)
      void queryClient.invalidateQueries({ queryKey: ticketKeys.byUser(ticket.userEmail) })
      void queryClient.invalidateQueries({ queryKey: ['event', ticket.eventCode] })
    },
  })
}

export function useCancelTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticket: TicketResponse) => cancelTicket(ticket.ticketCode),
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketKeys.detail(updated.ticketCode), updated)
      void queryClient.invalidateQueries({ queryKey: ticketKeys.byUser(updated.userEmail) })
      void queryClient.invalidateQueries({ queryKey: ticketKeys.paidByEvent(updated.eventCode) })
    },
  })
}
