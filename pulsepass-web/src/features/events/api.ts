import { http } from '../../lib/http'
import { EventResponseSchema, EventSummaryListSchema, type CreateEventRequest } from './types'

const eventPath = (eventCode: string) => `/events/${encodeURIComponent(eventCode)}`

export function getPublishedEvents(signal?: AbortSignal) {
  return http.get('/events/published', EventSummaryListSchema, { signal })
}

export function getEvent(eventCode: string, signal?: AbortSignal) {
  return http.get(eventPath(eventCode), EventResponseSchema, { signal })
}

export function getEventsByArtist(stageName: string, signal?: AbortSignal) {
  return http.get('/events/by-artist', EventSummaryListSchema, { params: { stageName }, signal })
}

// ADMIN: the event is created as DRAFT (the backend decides it).
export function createEvent(data: CreateEventRequest) {
  return http.post('/events', EventResponseSchema, data)
}

// ADMIN: DRAFT → PUBLISHED.
export function publishEvent(eventCode: string) {
  return http.patch(`${eventPath(eventCode)}/publish`, EventResponseSchema)
}

// ADMIN: associates an active artist with the event.
export function addArtistToEvent(eventCode: string, artistId: number) {
  return http.post(`${eventPath(eventCode)}/artists/${artistId}`, EventResponseSchema)
}
