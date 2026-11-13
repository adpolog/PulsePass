/**
 * Formato de presentación es-CO (NFR-FE-008).
 * Las fechas del backend son LocalDateTime sin zona: `new Date("2026-12-12T20:00:00")`
 * las interpreta en hora local, que es lo que se quiere mostrar.
 */

const LOCALE = 'es-CO'

const formatoMoneda = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const formatoFecha = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const formatoHora = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** 250000 → "$ 250.000" */
export function formatearPrecio(valor: number): string {
  return formatoMoneda.format(valor)
}

/** "2026-12-12T20:00:00" → "12 dic 2026" (sin los "de" que añade Intl). */
export function formatearFecha(iso: string): string {
  const partes = formatoFecha.formatToParts(new Date(iso))
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? ''
  return `${valor('day')} ${valor('month').replace('.', '')} ${valor('year')}`
}

/** "2026-12-12T20:00:00" → "12 dic 2026 · 20:00" */
export function formatearFechaHora(iso: string): string {
  return `${formatearFecha(iso)} · ${formatoHora.format(new Date(iso))}`
}
