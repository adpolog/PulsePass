import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelTicket,
  getPaidTicketsByEvent,
  getTicket,
  getTicketsByUser,
  markTicketUsed,
  purchaseTicket,
} from './api'
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

// With an empty code the query waits (on-demand search in check-in).
export function useTicket(ticketCode: string) {
  return useQuery({
    queryKey: ticketKeys.detail(ticketCode),
    queryFn: ({ signal }) => getTicket(ticketCode, signal),
    enabled: ticketCode.length > 0,
    staleTime: 15_000,
  })
}

export function usePaidTickets(eventCode: string) {
  return useQuery({
    queryKey: ticketKeys.paidByEvent(eventCode),
    queryFn: ({ signal }) => getPaidTicketsByEvent(eventCode, signal),
    enabled: eventCode.length > 0,
    staleTime: 15_000,
  })
}

export function useMarkTicketUsed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => markTicketUsed(ticketCode),
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketKeys.detail(updated.ticketCode), updated)
      void queryClient.invalidateQueries({ queryKey: ticketKeys.paidByEvent(updated.eventCode) })
      void queryClient.invalidateQueries({ queryKey: ticketKeys.byUser(updated.userEmail) })
    },
    // 409 = someone already used it (another door): reload the real state.
    onError: (_error, ticketCode) => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketCode) })
    },
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
