import { http } from '../../lib/http'
import { UserResponseSchema, type RegisterUserRequest } from './types'

export function registerUser(data: RegisterUserRequest) {
  return http.post('/users', UserResponseSchema, data)
}

export function getUserByEmail(email: string) {
  return http.get('/users/by-email', UserResponseSchema, { params: { email } })
}
