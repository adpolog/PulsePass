import { http } from '../../lib/http'
import { AuthResponseSchema, AuthenticatedUserSchema, type LoginRequest } from './types'

export function login(data: LoginRequest) {
  return http.post('/auth/login', AuthResponseSchema, data)
}

export function fetchCurrentUser() {
  return http.get('/auth/me', AuthenticatedUserSchema)
}
