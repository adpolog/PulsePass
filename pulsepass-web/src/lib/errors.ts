import { GENERIC_MESSAGE, NETWORK_MESSAGE, isApiError } from './http'

// PRD §13: maps any error to a safe message for the UI.
export function errorMessage(error: unknown): string {
  if (!isApiError(error)) return GENERIC_MESSAGE
  if (error.kind === 'network') return NETWORK_MESSAGE
  switch (error.status) {
    case 400:
    case 409:
      return error.message
    case 401:
      return 'Tu sesión expiró. Inicia sesión de nuevo.'
    case 403:
      return 'No tienes permisos para realizar esta acción.'
    case 404:
      return 'No encontramos lo que buscas.'
    default:
      return GENERIC_MESSAGE
  }
}

// 404 or 403 on a page load: the resource is shown as "not available".
export function isNotAvailable(error: unknown): boolean {
  return isApiError(error) && (error.status === 404 || error.status === 403)
}
