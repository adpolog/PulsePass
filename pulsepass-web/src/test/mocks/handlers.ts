import { http, HttpResponse } from 'msw'
import { artists, currentUser, event, myTickets, paidTickets, publishedEvents, userProfile, venue } from './data'

export const API = 'http://localhost/api'

export function errorBody(status: number, message: string, details: Record<string, string> = {}) {
  return HttpResponse.json(
    { timestamp: '2026-11-13T10:00:00', status, error: 'Error', message, details },
    { status },
  )
}

// Default happy-path responses; each test can override them with server.use().
export const handlers = [
  http.get(`${API}/events/published`, () => HttpResponse.json(publishedEvents)),
  http.get(`${API}/events/by-artist`, ({ request }) => {
    const stageName = new URL(request.url).searchParams.get('stageName')
    return HttpResponse.json(stageName === 'Solar Beat' ? [publishedEvents[0]] : [])
  }),
  http.get(`${API}/events/:eventCode`, ({ params }) =>
    params.eventCode === event.eventCode ? HttpResponse.json(event) : errorBody(404, 'Event not found'),
  ),
  http.get(`${API}/artists/active`, () => HttpResponse.json(artists)),
  http.get(`${API}/artists/:id`, ({ params }) => {
    const artist = artists.find((a) => a.id === Number(params.id))
    return artist ? HttpResponse.json(artist) : errorBody(404, 'Artist not found')
  }),
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({ accessToken: 'jwt-token', tokenType: 'Bearer', expiresIn: 900 }),
  ),
  http.get(`${API}/auth/me`, () => HttpResponse.json(currentUser)),
  http.get(`${API}/users/by-email`, () => HttpResponse.json(userProfile)),
  http.post(`${API}/users`, () => HttpResponse.json(userProfile, { status: 201 })),
  // /tickets/by-user goes before /tickets/:ticketCode, otherwise "by-user" would match as a code.
  http.get(`${API}/tickets/by-user`, () => HttpResponse.json(myTickets)),
  http.get(`${API}/tickets/:ticketCode`, ({ params }) => {
    const found = myTickets.find((t) => t.ticketCode === params.ticketCode)
    return found ? HttpResponse.json(found) : errorBody(404, 'Ticket not found.')
  }),
  http.patch(`${API}/tickets/:ticketCode/cancel`, ({ params }) => {
    const found = myTickets.find((t) => t.ticketCode === params.ticketCode)
    if (!found) return errorBody(404, 'Ticket not found.')
    if (found.status !== 'PAID') return errorBody(409, 'Only tickets in PAID status can be cancelled.')
    return HttpResponse.json({ ...found, status: 'CANCELLED' })
  }),
  http.patch(`${API}/tickets/:ticketCode/use`, ({ params }) => {
    const found = [...myTickets, ...paidTickets].find((t) => t.ticketCode === params.ticketCode)
    if (!found) return errorBody(404, 'Ticket not found.')
    if (found.status !== 'PAID') return errorBody(409, 'Only tickets in PAID status can be used.')
    return HttpResponse.json({ ...found, status: 'USED' })
  }),
  http.get(`${API}/events/:eventCode/tickets/paid`, ({ params }) =>
    params.eventCode === event.eventCode ? HttpResponse.json(paidTickets) : errorBody(404, 'Event not found'),
  ),
  http.get(`${API}/venues/active`, () => HttpResponse.json([venue])),
  http.get(`${API}/venues/:code`, ({ params }) =>
    params.code === venue.code ? HttpResponse.json(venue) : errorBody(404, 'Venue not found'),
  ),
]
