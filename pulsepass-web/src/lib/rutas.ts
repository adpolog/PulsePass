import { z } from 'zod'

export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  evento: (eventCode: string) => `/eventos/${encodeURIComponent(eventCode)}`,
  artistas: '/artistas',
  artista: (id: number) => `/artistas/${id}`,
  sedes: '/sedes',
  sede: (code: string) => `/sedes/${encodeURIComponent(code)}`,
  login: '/login',
  registro: '/registro',
  cuenta: '/cuenta',
  misTickets: '/mis-tickets',
  ticket: (ticketCode: string) => `/mis-tickets/${encodeURIComponent(ticketCode)}`,
  confirmacionCompra: (ticketCode: string) =>
    `/compra/confirmacion/${encodeURIComponent(ticketCode)}`,
  validacion: '/staff/validacion',
  ticketsPagados: (eventCode?: string) =>
    eventCode ? `/staff/eventos/${encodeURIComponent(eventCode)}/tickets` : '/staff/eventos/tickets',
  adminEventos: '/admin/eventos',
  adminNuevoEvento: '/admin/eventos/nuevo',
  adminEvento: (eventCode: string) => `/admin/eventos/${encodeURIComponent(eventCode)}`,
  sinPermisos: '/403',
} as const

const EstadoDesdeSchema = z.object({ desde: z.string().startsWith('/') })

// Ruta a la que volver tras el login (location.state se valida porque es externo).
export function leerDesde(state: unknown): string {
  const resultado = EstadoDesdeSchema.safeParse(state)
  return resultado.success ? resultado.data.desde : RUTAS.inicio
}
