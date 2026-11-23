import { z } from 'zod'

const enc = encodeURIComponent

export const ROUTES = {
  home: '/',
  events: '/events',
  event: (eventCode: string) => `/events/${enc(eventCode)}`,
  artists: '/artists',
  artist: (id: number) => `/artists/${id}`,
  venues: '/venues',
  venue: (code: string) => `/venues/${enc(code)}`,
  login: '/login',
  register: '/register',
  account: '/account',
  myTickets: '/my-tickets',
  ticket: (ticketCode: string) => `/my-tickets/${enc(ticketCode)}`,
  purchaseConfirmation: (ticketCode: string) => `/purchase/confirmation/${enc(ticketCode)}`,
  checkIn: '/staff/check-in',
  paidTickets: (eventCode?: string) =>
    eventCode ? `/staff/events/${enc(eventCode)}/tickets` : '/staff/events/tickets',
  adminEvents: '/admin/events',
  adminNewEvent: '/admin/events/new',
  adminEvent: (eventCode: string) => `/admin/events/${enc(eventCode)}`,
  forbidden: '/403',
} as const

const RedirectStateSchema = z.object({ from: z.string().startsWith('/') })

// Where to go back after login. location.state is external data, so it is validated.
export function readRedirect(state: unknown): string {
  const result = RedirectStateSchema.safeParse(state)
  return result.success ? result.data.from : ROUTES.home
}
