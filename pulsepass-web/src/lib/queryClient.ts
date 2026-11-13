import { QueryClient } from '@tanstack/react-query'
import { esApiError } from './http'

// PRD §14.3: no se reintentan los 4xx; un reintento para red y 5xx; mutaciones nunca.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (intentos, error) => {
        if (esApiError(error) && error.status >= 400 && error.status < 500) return false
        return intentos < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
