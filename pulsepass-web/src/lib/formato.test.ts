import { describe, expect, it } from 'vitest'
import { formatearFecha, formatearFechaHora, formatearPrecio } from './formato'

describe('formato es-CO', () => {
  it('precio en COP sin decimales', () => {
    expect(formatearPrecio(250000)).toMatch(/^\$\s250\.000$/)
  })

  it('fecha corta sin los "de" de Intl', () => {
    expect(formatearFecha('2026-12-12T20:00:00')).toBe('12 dic 2026')
  })

  it('fecha y hora en 24 h', () => {
    expect(formatearFechaHora('2026-12-12T20:00:00')).toBe('12 dic 2026 · 20:00')
  })
})
