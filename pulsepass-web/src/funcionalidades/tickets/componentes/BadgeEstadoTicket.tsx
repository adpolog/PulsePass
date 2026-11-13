import Badge, { type TonoBadge } from '../../../componentes/Badge'
import type { TicketStatus } from '../tipos'

const tonoPorEstado: Record<TicketStatus, TonoBadge> = {
  RESERVED: 'info',
  PAID: 'exito',
  USED: 'apagado',
  CANCELLED: 'peligro',
}

export default function BadgeEstadoTicket({ estado }: { estado: TicketStatus }) {
  return <Badge tono={tonoPorEstado[estado]}>{estado}</Badge>
}
