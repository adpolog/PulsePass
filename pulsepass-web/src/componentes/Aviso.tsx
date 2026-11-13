import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { IconoAlerta, IconoCerrar, IconoCheck, IconoInfo } from './iconos'

/**
 * Aviso en línea o como toast (PRD §9.1, §9.20, DES-10).
 * `error` usa role="alert" (se anuncia de inmediato); el resto role="status" (polite).
 * El mensaje se renderiza siempre como texto, nunca como HTML.
 */
export type TipoAviso = 'exito' | 'error' | 'advertencia' | 'info'

const estilos: Record<TipoAviso, string> = {
  exito: 'border-neon-800 bg-neon-950 text-neon-200',
  error: 'border-red-900 bg-red-950/70 text-red-200',
  advertencia: 'border-amber-800 bg-amber-950/70 text-amber-200',
  info: 'border-tinta-600 bg-tinta-850 text-tinta-300',
}

const iconos: Record<TipoAviso, typeof IconoAlerta> = {
  exito: IconoCheck,
  error: IconoAlerta,
  advertencia: IconoAlerta,
  info: IconoInfo,
}

interface PropsAviso {
  tipo: TipoAviso
  children: ReactNode
  onCerrar?: () => void
  className?: string
}

export default function Aviso({ tipo, children, onCerrar, className }: PropsAviso) {
  const Icono = iconos[tipo]
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={clsx('flex items-start gap-2.5 rounded-lg border p-3 text-sm', estilos[tipo], className)}
    >
      <Icono className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="-m-1 rounded p-1 opacity-70 hover:opacity-100"
        >
          <IconoCerrar className="size-4" />
        </button>
      )}
    </div>
  )
}
