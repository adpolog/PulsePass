import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Loading from '../components/Loading'
import PageHeader from '../components/PageHeader'
import ArtistCard from '../features/artists/components/ArtistCard'
import { useActiveArtists } from '../features/artists/hooks'
import { errorMessage } from '../lib/errors'

export default function ArtistList() {
  const artists = useActiveArtists()

  return (
    <Container>
      <PageHeader eyebrow="Line-up" title="Artistas" />
      {artists.isPending ? (
        <Loading count={6} />
      ) : artists.isError ? (
        <ErrorState message={errorMessage(artists.error)} onRetry={() => void artists.refetch()} />
      ) : artists.data.length === 0 ? (
        <EmptyState message="Aún no hay artistas activos" />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artists.data.map((artist) => (
            <li key={artist.id} className="grid">
              <ArtistCard artist={artist} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
