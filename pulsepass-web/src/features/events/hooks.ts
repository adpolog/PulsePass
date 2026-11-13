import { useQuery } from '@tanstack/react-query'
import { getEvent, getEventsByArtist, getPublishedEvents } from './api'

export function usePublishedEvents() {
  return useQuery({
    queryKey: ['events', 'published'],
    queryFn: ({ signal }) => getPublishedEvents(signal),
    staleTime: 60_000,
  })
}

export function useEvent(eventCode: string) {
  return useQuery({
    queryKey: ['event', eventCode],
    queryFn: ({ signal }) => getEvent(eventCode, signal),
    staleTime: 30_000,
  })
}

export function useEventsByArtist(stageName: string | undefined) {
  return useQuery({
    queryKey: ['events', 'artist', stageName],
    queryFn: ({ signal }) => getEventsByArtist(stageName ?? '', signal),
    enabled: Boolean(stageName),
    staleTime: 60_000,
  })
}
