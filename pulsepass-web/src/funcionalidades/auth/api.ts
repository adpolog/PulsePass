import { http } from '../../lib/http'
import {
  AuthResponseSchema,
  UsuarioAutenticadoSchema,
  type LoginRequest,
} from './tipos'

export function login(datos: LoginRequest) {
  return http.post('/auth/login', AuthResponseSchema, datos)
}

export function obtenerUsuarioActual() {
  return http.get('/auth/me', UsuarioAutenticadoSchema)
}
