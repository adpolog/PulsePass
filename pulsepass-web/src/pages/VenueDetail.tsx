import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import BackLink from '../components/BackLink'
import Badge from '../components/Badge'
import Card from '../components/Card'
import Container from '../components/Container'
import ErrorState from '../components/ErrorState'
import Loading from '../components/Loading'
import { useVenue } from '../features/venues/hooks'
import { errorMessage, isNotAvailable } from '../lib/errors'
import { ROUTES } from '../lib/routes'
import NotFound from './NotFound'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  )
}

export default function VenueDetail() {
  const { code = '' } = useParams<{ code: string }>()
  const venue = useVenue(code)

  if (venue.isError && isNotAvailable(venue.error)) return <NotFound />

  return (
    <Container width="narrow">
      <BackLink to={ROUTES.venues}>Sedes</BackLink>
      {venue.isPending ? (
        <Loading count={1} className="lg:grid-cols-1" />
      ) : venue.isError ? (
        <ErrorState message={errorMessage(venue.error)} onRetry={() => void venue.refetch()} />
      ) : (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold">{venue.data.name}</h1>
            <Badge tone={venue.data.active ? 'success' : 'muted'}>{venue.data.active ? 'Activa' : 'Inactiva'}</Badge>
          </div>
          <dl className="mt-6 divide-y divide-line text-sm">
            <Row label="Código">
              <span className="font-mono">{venue.data.code}</span>
            </Row>
            <Row label="Ciudad">{venue.data.city}</Row>
            <Row label="Dirección">{venue.data.address ?? 'No registrada'}</Row>
            <Row label="Capacidad">{venue.data.capacity} personas</Row>
          </dl>
        </Card>
      )}
    </Container>
  )
}
