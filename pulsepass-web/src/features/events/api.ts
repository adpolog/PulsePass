import { http } from '../../lib/http'
import { EventResponseSchema, EventSummaryListSchema } from './types'

export function getPublishedEvents(signal?: AbortSignal) {
  return http.get('/events/published', EventSummaryListSchema, { signal })
}

export function getEvent(eventCode: string, signal?: AbortSignal) {
  return http.get(`/events/${encodeURIComponent(eventCode)}`, EventResponseSchema, { signal })
}

export function getEventsByArtist(stageName: string, signal?: AbortSignal) {
  return http.get('/events/by-artist', EventSummaryListSchema, { params: { stageName }, signal })
}
