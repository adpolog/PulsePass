import { describe, expect, it } from 'vitest'
import { dateParts, formatDate, formatDateTime, formatPrice } from './format'

describe('es-CO format', () => {
  it('TEST-FE-LIB-005: formats 250000 as COP', () => {
    expect(formatPrice(250000)).toMatch(/^\$\s250\.000$/)
  })

  it('short date without the "de" added by Intl', () => {
    expect(formatDate('2026-12-12T20:00:00')).toBe('12 dic 2026')
  })

  it('date and 24h time', () => {
    expect(formatDateTime('2026-12-12T20:00:00')).toBe('12 dic 2026 · 20:00')
  })

  it('day and month for the card date block', () => {
    expect(dateParts('2026-12-12T20:00:00')).toEqual({ day: '12', month: 'dic' })
  })
})
