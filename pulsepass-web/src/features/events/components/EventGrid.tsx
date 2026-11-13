import type { EventSummaryResponse } from '../types'
import EventCard from './EventCard'

export default function EventGrid({ events }: { events: EventSummaryResponse[] }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.eventCode} className="grid">
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  )
}
