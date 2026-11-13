import { useParams } from 'react-router'
import Badge from '../components/Badge'
import BackLink from '../components/BackLink'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Loading from '../components/Loading'
import ArtistAvatar from '../features/artists/components/ArtistAvatar'
import { useArtist } from '../features/artists/hooks'
import type { ArtistResponse } from '../features/artists/types'
import EventGrid from '../features/events/components/EventGrid'
import { useEventsByArtist } from '../features/events/hooks'
import { errorMessage, isNotAvailable } from '../lib/errors'
import { ROUTES } from '../lib/routes'
import NotFound from './NotFound'

function ArtistEvents({ artist }: { artist: ArtistResponse }) {
  const events = useEventsByArtist(artist.stageName)

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">Próximos eventos de {artist.stageName}</h2>
      {events.isPending ? (
        <Loading count={2} />
      ) : events.isError ? (
        <ErrorState message={errorMessage(events.error)} onRetry={() => void events.refetch()} />
      ) : events.data.length === 0 ? (
        <EmptyState message="Sin eventos próximos" />
      ) : (
        <EventGrid events={events.data} />
      )}
    </section>
  )
}

function ArtistContent({ id }: { id: number }) {
  const artist = useArtist(id)

  if (artist.isPending) return <Loading count={1} />
  if (artist.isError) {
    if (isNotAvailable(artist.error)) return <NotFound />
    return <ErrorState message={errorMessage(artist.error)} onRetry={() => void artist.refetch()} />
  }

  const data = artist.data
  return (
    <>
      <div className="flex flex-col items-start gap-6 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
        <ArtistAvatar name={data.stageName} size="lg" />
        <div>
          <h1 className="text-4xl font-bold">{data.stageName}</h1>
          <p className="mt-1 font-mono text-sm text-muted">
            {[data.genre, data.country].filter(Boolean).join(' · ') || 'Nombre artístico'}
          </p>
          <Badge tone={data.active ? 'success' : 'muted'} className="mt-3">
            {data.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>
      <ArtistEvents artist={data} />
    </>
  )
}

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>()
  const artistId = Number(id)

  // Invalid id: UI 404 without calling the API.
  if (!id || !Number.isInteger(artistId) || artistId <= 0) return <NotFound />

  return (
    <Container>
      <BackLink to={ROUTES.artists}>Artistas</BackLink>
      <ArtistContent id={artistId} />
    </Container>
  )
}
