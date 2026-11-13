import { useQuery } from '@tanstack/react-query'
import { findArtistsByStageName, getActiveArtists, getArtist } from './api'

export function useActiveArtists() {
  return useQuery({
    queryKey: ['artists', 'active'],
    queryFn: ({ signal }) => getActiveArtists(signal),
    staleTime: 5 * 60_000,
  })
}

export function useArtist(id: number) {
  return useQuery({
    queryKey: ['artist', id],
    queryFn: ({ signal }) => getArtist(id, signal),
    staleTime: 5 * 60_000,
  })
}

export function useArtistsByStageName(stageName: string | undefined) {
  return useQuery({
    queryKey: ['artists', 'stage-name', stageName],
    queryFn: ({ signal }) => findArtistsByStageName(stageName ?? '', signal),
    enabled: Boolean(stageName),
    staleTime: 5 * 60_000,
  })
}
