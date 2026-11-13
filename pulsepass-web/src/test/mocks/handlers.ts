import { http, HttpResponse } from 'msw'
import { artists, event, publishedEvents, venue } from './data'

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
  http.get(`${API}/venues/active`, () => HttpResponse.json([venue])),
  http.get(`${API}/venues/:code`, ({ params }) =>
    params.code === venue.code ? HttpResponse.json(venue) : errorBody(404, 'Venue not found'),
  ),
]
