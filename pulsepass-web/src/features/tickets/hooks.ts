import { useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseTicket } from './api'
import type { PurchaseTicketRequest } from './types'

export function useBuyTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PurchaseTicketRequest) => purchaseTicket(data),
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ['tickets', 'user', ticket.userEmail] })
      void queryClient.invalidateQueries({ queryKey: ['event', ticket.eventCode] })
    },
  })
}
