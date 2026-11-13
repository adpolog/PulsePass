const LOCALE = 'es-CO'

const currencyFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// 250000 → "$ 250.000"
export function formatPrice(value: number): string {
  return currencyFormat.format(value)
}

// "2026-12-12T20:00:00" → "12 dic 2026" (without the "de" Intl adds).
export function formatDate(iso: string): string {
  const parts = dateFormat.formatToParts(new Date(iso))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('day')} ${part('month').replace('.', '')} ${part('year')}`
}

// "2026-12-12T20:00:00" → "12 dic 2026 · 20:00"
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${timeFormat.format(new Date(iso))}`
}

// "2026-12-12T20:00:00" → { day: "12", month: "dic" } for the date block of cards.
export function dateParts(iso: string): { day: string; month: string } {
  const parts = dateFormat.formatToParts(new Date(iso))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: part('day'), month: part('month').replace('.', '') }
}
