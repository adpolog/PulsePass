import { http } from '../../lib/http'
import { ArtistListSchema, ArtistResponseSchema } from './types'

export function getActiveArtists(signal?: AbortSignal) {
  return http.get('/artists/active', ArtistListSchema, { signal })
}

export function getArtist(id: number, signal?: AbortSignal) {
  return http.get(`/artists/${id}`, ArtistResponseSchema, { signal })
}

export function findArtistsByStageName(stageName: string, signal?: AbortSignal) {
  return http.get('/artists/by-stage-name', ArtistListSchema, { params: { stageName }, signal })
}
