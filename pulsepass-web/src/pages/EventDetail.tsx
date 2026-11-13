import { Link, useParams } from 'react-router'
import BackLink from '../components/BackLink'
import Container from '../components/Container'
import ErrorState from '../components/ErrorState'
import { IconBuilding, IconCalendar, IconUser } from '../components/icons'
import { Skeleton } from '../components/Loading'
import NotAvailable from '../components/NotAvailable'
import ArtistAvatar from '../features/artists/components/ArtistAvatar'
import CategoryLabel from '../features/events/components/CategoryLabel'
import EventStatusBadge from '../features/events/components/EventStatusBadge'
import { useEvent } from '../features/events/hooks'
import PurchasePanel from '../features/tickets/components/PurchasePanel'
import { errorMessage, isNotAvailable } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import { ROUTES } from '../lib/routes'

export default function EventDetail() {
  const { eventCode = '' } = useParams<{ eventCode: string }>()
  const event = useEvent(eventCode)

  if (event.isPending) {
    return (
      <Container>
        <div aria-busy="true" className="space-y-4">
          <span className="sr-only" role="status">
            Cargando evento…
          </span>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Container>
    )
  }

  if (event.isError) {
    if (isNotAvailable(event.error)) {
      return <NotAvailable message="Evento no disponible" backTo={ROUTES.events} backLabel="Volver a la cartelera" />
    }
    return (
      <Container>
        <ErrorState message={errorMessage(event.error)} onRetry={() => void event.refetch()} />
      </Container>
    )
  }

  const data = event.data

  return (
    <Container className="pb-28 md:pb-10">
      <BackLink to={ROUTES.events}>Volver a la cartelera</BackLink>

      <div className="grid gap-6 md:grid-cols-[1fr_20rem] md:items-start">
        <article className="space-y-8">
          <header className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <CategoryLabel category={data.category} />
              <EventStatusBadge status={data.status} />
            </div>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{data.name}</h1>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <IconCalendar className="size-4 text-neon-400" />
                {formatDateTime(data.eventDate)}
              </li>
              {data.minimumAge !== null && (
                <li className="flex items-center gap-2">
                  <IconUser className="size-4 text-neon-400" />
                  Edad mínima: {data.minimumAge}
                </li>
              )}
            </ul>
            {data.description && <p className="mt-6 leading-relaxed text-ink-300">{data.description}</p>}
          </header>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Artistas</h2>
            {data.artists.length === 0 ? (
              <p className="text-sm text-muted">Aún no hay artistas confirmados.</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {data.artists.map((artist) => (
                  <li key={artist.id}>
                    <Link
                      to={ROUTES.artist(artist.id)}
                      className="flex items-center gap-3 rounded-full border border-line bg-surface py-1.5 pr-5 pl-1.5 hover:border-neon-400"
                    >
                      <ArtistAvatar name={artist.stageName} size="sm" />
                      <span className="font-medium">{artist.stageName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {data.venueCode && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">Sede</h2>
              <Link
                to={ROUTES.venue(data.venueCode)}
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-neon-400"
              >
                <IconBuilding className="size-6 text-neon-400" />
                <div>
                  <p className="font-semibold">{data.venueName}</p>
                  <p className="font-mono text-xs text-muted">{data.venueCode}</p>
                </div>
              </Link>
            </section>
          )}
        </article>

        <aside className="md:sticky md:top-24">
          <PurchasePanel event={data} />
        </aside>
      </div>
    </Container>
  )
}
