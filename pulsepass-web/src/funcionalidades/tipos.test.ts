import { afterEach, describe, expect, it, vi } from 'vitest'
import { UsuarioAutenticadoSchema } from './auth/tipos'
import { EventResponseSchema } from './eventos/tipos'
import { TicketResponseSchema } from './tickets/tipos'
import { RegisterUserRequestSchema } from './usuarios/tipos'

describe('UsuarioAutenticadoSchema', () => {
  it('normaliza las authorities de Spring a roles del dominio', () => {
    const usuario = UsuarioAutenticadoSchema.parse({
      id: 1,
      username: 'andrea',
      email: 'andrea@pulsepass.test',
      roles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_DESCONOCIDO'],
    })
    expect(usuario.roles).toEqual(['USER', 'ADMIN'])
  })
})

describe('EventResponseSchema', () => {
  it('acepta la forma real del backend y normaliza artists null a []', () => {
    const evento = EventResponseSchema.parse({
      id: 1,
      eventCode: 'CMF-2026',
      name: 'Caribbean Music Fest 2026',
      description: null,
      category: 'MUSIC',
      status: 'DRAFT',
      eventDate: '2026-12-12T20:00:00',
      minimumAge: 18,
      venueCode: 'VEN-SMR-01',
      venueName: 'Marina Convention Center',
      artists: null,
    })
    expect(evento.artists).toEqual([])
  })
})

describe('TicketResponseSchema', () => {
  it('convierte el BigDecimal del precio a número', () => {
    const ticket = TicketResponseSchema.parse({
      id: 1,
      ticketCode: 'TKT-8F2A1C',
      type: 'VIP',
      price: 250000.0,
      status: 'PAID',
      purchaseDate: '2026-11-05T14:32:10.123',
      userEmail: 'andrea@pulsepass.test',
      eventCode: 'CMF-2026',
      eventName: 'Caribbean Music Fest 2026',
      holderName: 'Andrea Ruiz',
    })
    expect(ticket.price).toBe(250000)
  })
})

describe('RegisterUserRequestSchema', () => {
  const valido = {
    username: 'andrea',
    email: 'andrea@pulsepass.test',
    firstName: 'Andrea',
    lastName: 'Ruiz',
    birthDate: '1998-04-12',
    password: 'contrasena-segura',
  }

  afterEach(() => {
    vi.useRealTimers()
  })

  it('acepta un registro válido', () => {
    expect(RegisterUserRequestSchema.safeParse(valido).success).toBe(true)
  })

  it('rechaza contraseña de 11 caracteres (AC-FE-005)', () => {
    const r = RegisterUserRequestSchema.safeParse({ ...valido, password: '12345678901' })
    expect(r.success).toBe(false)
  })

  it('rechaza contraseña de más de 72 bytes UTF-8 aunque tenga menos de 72 caracteres', () => {
    const r = RegisterUserRequestSchema.safeParse({ ...valido, password: 'ñ'.repeat(40) })
    expect(r.success).toBe(false)
  })

  it('rechaza fecha de nacimiento futura (fecha inyectada)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T12:00:00'))
    expect(RegisterUserRequestSchema.safeParse({ ...valido, birthDate: '2026-11-14' }).success).toBe(
      false,
    )
    expect(RegisterUserRequestSchema.safeParse({ ...valido, birthDate: '2026-11-13' }).success).toBe(
      true,
    )
  })
})
