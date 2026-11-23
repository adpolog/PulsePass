import { useQuery } from '@tanstack/react-query'
import { getActiveVenues, getVenue } from './api'

export function useActiveVenues() {
  return useQuery({
    queryKey: ['venues', 'active'],
    queryFn: ({ signal }) => getActiveVenues(signal),
    staleTime: 5 * 60_000,
  })
}

export function useVenue(code: string) {
  return useQuery({
    queryKey: ['venue', code],
    queryFn: ({ signal }) => getVenue(code, signal),
    staleTime: 5 * 60_000,
  })
}
