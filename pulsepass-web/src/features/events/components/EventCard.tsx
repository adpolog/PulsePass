import { Link } from 'react-router'
import { IconMapPin } from '../../../components/icons'
import { dateParts } from '../../../lib/format'
import { ROUTES } from '../../../lib/routes'
import type { EventSummaryResponse } from '../types'
import CategoryLabel from './CategoryLabel'
import EventStatusBadge from './EventStatusBadge'

export default function EventCard({ event }: { event: EventSummaryResponse }) {
  const { day, month } = dateParts(event.eventDate)
  const place = event.venueCity ?? event.venueName ?? 'Sede por confirmar'

  return (
    <Link
      to={ROUTES.event(event.eventCode)}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-neon-400 hover:shadow-neon"
    >
      <div className="flex items-start gap-4">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-line-strong py-2 group-hover:border-neon-400">
          <span className="font-display text-2xl leading-none font-bold">{day}</span>
          <span className="mt-1 font-mono text-[11px] tracking-wider text-neon-400 uppercase">{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <CategoryLabel category={event.category} />
          <h3 className="mt-1 text-lg leading-snug font-semibold group-hover:text-neon-300">{event.name}</h3>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm text-muted">
        <span className="flex min-w-0 items-center gap-1.5">
          <IconMapPin className="size-4 shrink-0" />
          <span className="truncate">{place}</span>
        </span>
        <EventStatusBadge status={event.status} />
      </div>
    </Link>
  )
}
