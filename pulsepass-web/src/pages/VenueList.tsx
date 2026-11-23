import { Link } from 'react-router'
import Badge from '../components/Badge'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { IconMapPin } from '../components/icons'
import Loading from '../components/Loading'
import PageHeader from '../components/PageHeader'
import { useActiveVenues } from '../features/venues/hooks'
import { errorMessage } from '../lib/errors'
import { ROUTES } from '../lib/routes'

const capacityFormat = new Intl.NumberFormat('es-CO')

export default function VenueList() {
  const venues = useActiveVenues()

  return (
    <Container>
      <PageHeader eyebrow="Lugares" title="Sedes" />
      {venues.isPending ? (
        <Loading count={3} />
      ) : venues.isError ? (
        <ErrorState message={errorMessage(venues.error)} onRetry={() => void venues.refetch()} />
      ) : venues.data.length === 0 ? (
        <EmptyState message="Aún no hay sedes activas" />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.data.map((venue) => (
            <li key={venue.code} className="grid">
              <Link
                to={ROUTES.venue(venue.code)}
                className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 transition hover:border-neon-400 hover:shadow-neon"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold group-hover:text-neon-300">{venue.name}</h2>
                  <Badge tone="success">Activa</Badge>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <IconMapPin className="size-4" />
                  {venue.city} · Cap. {capacityFormat.format(venue.capacity)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
