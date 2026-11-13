import Badge, { type TonoBadge } from '../../../componentes/Badge'
import type { EventStatus } from '../tipos'

const tonoPorEstado: Record<EventStatus, TonoBadge> = {
  DRAFT: 'neutro',
  PUBLISHED: 'exito',
  SOLD_OUT: 'advertencia',
  CANCELLED: 'peligro',
  FINISHED: 'apagado',
}

export default function BadgeEstadoEvento({ estado }: { estado: EventStatus }) {
  return <Badge tono={tonoPorEstado[estado]}>{estado}</Badge>
}
