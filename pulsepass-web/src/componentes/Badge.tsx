import { clsx } from 'clsx'
import type { ReactNode } from 'react'

/**
 * Tonos de badge (PRD §9.1 adaptado a la paleta neón).
 * Las clases están completas: nunca se construyen dinámicamente (FE-008).
 */
export type TonoBadge = 'exito' | 'neutro' | 'advertencia' | 'peligro' | 'info' | 'apagado'

const tonos: Record<TonoBadge, string> = {
  exito: 'bg-neon-950 text-neon-300 ring-neon-800',
  neutro: 'bg-tinta-800 text-white ring-tinta-600',
  advertencia: 'bg-amber-950 text-amber-300 ring-amber-800',
  peligro: 'bg-red-950 text-red-300 ring-red-900',
  info: 'bg-sky-950 text-sky-300 ring-sky-800',
  apagado: 'bg-tinta-850 text-tinta-400 ring-tinta-700',
}

interface PropsBadge {
  tono: TonoBadge
  children: ReactNode
  className?: string
}

export default function Badge({ tono, children, className }: PropsBadge) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase ring-1 ring-inset',
        tonos[tono],
        className,
      )}
    >
      {children}
    </span>
  )
}
