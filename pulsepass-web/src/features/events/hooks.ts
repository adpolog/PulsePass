import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ArtistResponse } from '../artists/types'
import { addArtistToEvent, createEvent, getEvent, getEventsByArtist, getPublishedEvents, publishEvent } from './api'
import type { CreateEventRequest } from './types'

// Query keys in one place so queries and invalidations cannot drift apart (PRD §14.1).
export const eventKeys = {
  published: ['events', 'published'] as const,
  detail: (eventCode: string) => ['event', eventCode] as const,
  byArtist: (stageName: string | undefined) => ['events', 'artist', stageName] as const,
}

export function usePublishedEvents() {
  return useQuery({
    queryKey: eventKeys.published,
    queryFn: ({ signal }) => getPublishedEvents(signal),
    staleTime: 60_000,
  })
}

// With an empty code the query waits.
export function useEvent(eventCode: string) {
  return useQuery({
    queryKey: eventKeys.detail(eventCode),
    queryFn: ({ signal }) => getEvent(eventCode, signal),
    enabled: eventCode.length > 0,
    staleTime: 30_000,
  })
}

export function useEventsByArtist(stageName: string | undefined) {
  return useQuery({
    queryKey: eventKeys.byArtist(stageName),
    queryFn: ({ signal }) => getEventsByArtist(stageName ?? '', signal),
    enabled: Boolean(stageName),
    staleTime: 60_000,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventRequest) => createEvent(data),
    // Seeds the cache: the management page opens without a second request.
    onSuccess: (created) => queryClient.setQueryData(eventKeys.detail(created.eventCode), created),
  })
}

export function usePublishEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventCode: string) => publishEvent(eventCode),
    onSuccess: (updated) => {
      queryClient.setQueryData(eventKeys.detail(updated.eventCode), updated)
      void queryClient.invalidateQueries({ queryKey: eventKeys.published })
    },
  })
}

export function useAddArtist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventCode, artist }: { eventCode: string; artist: ArtistResponse }) =>
      addArtistToEvent(eventCode, artist.id),
    onSuccess: (updated, { artist }) => {
      queryClient.setQueryData(eventKeys.detail(updated.eventCode), updated)
      void queryClient.invalidateQueries({ queryKey: eventKeys.byArtist(artist.stageName) })
    },
  })
}
