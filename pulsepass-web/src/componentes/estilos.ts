import { clsx } from 'clsx'

/**
 * Clases compartidas de los componentes base (FE-008: mapas completos, sin clases dinámicas).
 * Viven fuera de los .tsx para no romper Fast Refresh.
 */

// ─── Botones ─────────────────────────────────────────────────────────────────

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

const baseBoton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold ' +
  'transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco ' +
  'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-tinta-800 ' +
  'disabled:text-texto-deshabilitado disabled:shadow-none'

const variantesBoton: Record<VarianteBoton, string> = {
  primario:
    'bg-primario text-sobre-primario shadow-neon-sm hover:bg-primario-hover hover:shadow-neon',
  secundario:
    'border border-borde-fuerte bg-transparent text-texto hover:border-neon-400 hover:text-neon-300',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma: 'bg-transparent text-neon-400 hover:bg-neon-950',
}

/** Clases de botón; también sirven para <Link> con aspecto de botón. */
export function clasesBoton(variante: VarianteBoton = 'primario', className?: string): string {
  return clsx(baseBoton, variantesBoton[variante], className)
}

// ─── Controles de formulario (Campo, Selector) ───────────────────────────────

export const clasesControl =
  'block min-h-11 w-full rounded-lg border bg-campo px-3 text-sm text-texto ' +
  'placeholder:text-texto-deshabilitado transition ' +
  'focus-visible:border-neon-400 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foco ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export const clasesControlEstado = {
  normal: 'border-borde hover:border-borde-fuerte',
  error: 'border-red-500',
} as const

/** id del texto que describe al control: el error tiene prioridad sobre la ayuda. */
export function idsDescripcion(id: string, error?: string, ayuda?: string): string | undefined {
  if (error) return `${id}-error`
  if (ayuda) return `${id}-ayuda`
  return undefined
}
