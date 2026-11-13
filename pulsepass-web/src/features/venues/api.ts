import { http } from '../../lib/http'
import { VenueListSchema, VenueResponseSchema } from './types'

export function getActiveVenues(signal?: AbortSignal) {
  return http.get('/venues/active', VenueListSchema, { signal })
}

export function getVenue(code: string, signal?: AbortSignal) {
  return http.get(`/venues/${encodeURIComponent(code)}`, VenueResponseSchema, { signal })
}
