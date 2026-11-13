import Badge, { type BadgeTone } from '../../../components/Badge'
import type { EventStatus } from '../types'

const toneByStatus: Record<EventStatus, BadgeTone> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  SOLD_OUT: 'warning',
  CANCELLED: 'danger',
  FINISHED: 'muted',
}

export default function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>
}
