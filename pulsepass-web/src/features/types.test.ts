import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthenticatedUserSchema } from './auth/types'
import { EventResponseSchema } from './events/types'
import { TicketResponseSchema } from './tickets/types'
import { RegisterUserRequestSchema } from './users/types'

describe('AuthenticatedUserSchema', () => {
  it('maps Spring authorities to domain roles', () => {
    const user = AuthenticatedUserSchema.parse({
      id: 1,
      username: 'andrea',
      email: 'andrea@pulsepass.test',
      roles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_UNKNOWN'],
    })
    expect(user.roles).toEqual(['USER', 'ADMIN'])
  })
})

describe('EventResponseSchema', () => {
  it('accepts the backend shape and turns null artists into []', () => {
    const event = EventResponseSchema.parse({
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
    expect(event.artists).toEqual([])
  })
})

describe('TicketResponseSchema', () => {
  it('converts the BigDecimal price to a number', () => {
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
  const valid = {
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

  it('accepts a valid registration', () => {
    expect(RegisterUserRequestSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an 11-character password (AC-FE-005)', () => {
    expect(RegisterUserRequestSchema.safeParse({ ...valid, password: '12345678901' }).success).toBe(false)
  })

  it('rejects a password over 72 UTF-8 bytes even with fewer than 72 characters', () => {
    expect(RegisterUserRequestSchema.safeParse({ ...valid, password: 'ñ'.repeat(40) }).success).toBe(false)
  })

  it('rejects a future birth date (injected clock)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T12:00:00'))
    expect(RegisterUserRequestSchema.safeParse({ ...valid, birthDate: '2026-11-14' }).success).toBe(false)
    expect(RegisterUserRequestSchema.safeParse({ ...valid, birthDate: '2026-11-13' }).success).toBe(true)
  })
})
