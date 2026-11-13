import type { ReactNode } from 'react'
import { IconoBandeja } from './iconos'

interface PropsEstadoVacio {
  mensaje: string
  /** Acción sugerida (p. ej. un enlace a la cartelera). */
  accion?: ReactNode
}

/** Estado vacío (PRD §9.20): ícono, mensaje y acción sugerida. */
export default function EstadoVacio({ mensaje, accion }: PropsEstadoVacio) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-borde-fuerte bg-superficie px-6 py-10 text-center">
      <IconoBandeja className="size-8 text-neon-400" />
      <p className="font-semibold">{mensaje}</p>
      {accion}
    </div>
  )
}
