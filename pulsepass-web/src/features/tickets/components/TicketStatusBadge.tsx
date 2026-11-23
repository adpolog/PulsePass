import Badge, { type BadgeTone } from '../../../components/Badge'
import type { TicketStatus } from '../types'

const toneByStatus: Record<TicketStatus, BadgeTone> = {
  RESERVED: 'info',
  PAID: 'success',
  USED: 'muted',
  CANCELLED: 'danger',
}

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>
}
