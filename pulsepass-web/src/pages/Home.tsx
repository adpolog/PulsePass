import { Link } from 'react-router'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { IconArrowRight } from '../components/icons'
import Loading from '../components/Loading'
import { buttonClasses } from '../components/styles'
import ArtistAvatar from '../features/artists/components/ArtistAvatar'
import { useActiveArtists } from '../features/artists/hooks'
import { useAuth } from '../features/auth/hooks'
import EventGrid from '../features/events/components/EventGrid'
import { usePublishedEvents } from '../features/events/hooks'
import { errorMessage } from '../lib/errors'
import { ROUTES } from '../lib/routes'

function SectionHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-neon-400 hover:text-neon-300">
        Ver todos <IconArrowRight className="size-4" />
      </Link>
    </div>
  )
}

export default function Home() {
  const { session } = useAuth()
  const events = usePublishedEvents()
  const artists = useActiveArtists()

  const upcoming = [...(events.data ?? [])].sort((a, b) => a.eventDate.localeCompare(b.eventDate)).slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden px-4 pt-16 pb-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgb(57_255_20/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(57_255_20/0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mono text-xs tracking-widest text-neon-400 uppercase">// Temporada 2026</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] font-bold sm:text-6xl">
            Descubre los mejores <span className="text-neon-400 drop-shadow-[0_0_18px_rgb(57_255_20/0.5)]">eventos</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">Música, cultura, deporte y tecnología en un solo lugar.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={ROUTES.events} className={buttonClasses('primary', 'px-7')}>
              Ver cartelera
            </Link>
            {session.status !== 'authenticated' && (
              <Link to={ROUTES.register} className={buttonClasses('secondary', 'px-7')}>
                Crear cuenta
              </Link>
            )}
          </div>
        </div>
      </section>

      <Container className="space-y-14 pt-0">
        <section>
          <SectionHeader title="Próximos eventos" to={ROUTES.events} />
          {events.isPending ? (
            <Loading />
          ) : events.isError ? (
            <ErrorState message={errorMessage(events.error)} onRetry={() => void events.refetch()} />
          ) : upcoming.length === 0 ? (
            <EmptyState message="Aún no hay eventos publicados" />
          ) : (
            <EventGrid events={upcoming} />
          )}
        </section>

        <section>
          <SectionHeader title="Artistas destacados" to={ROUTES.artists} />
          {artists.isPending ? (
            <Loading count={2} />
          ) : artists.isError ? (
            <ErrorState message={errorMessage(artists.error)} onRetry={() => void artists.refetch()} />
          ) : artists.data.length === 0 ? (
            <EmptyState message="Aún no hay artistas activos" />
          ) : (
            <ul className="flex flex-wrap gap-3">
              {artists.data.slice(0, 6).map((artist) => (
                <li key={artist.id}>
                  <Link
                    to={ROUTES.artist(artist.id)}
                    className="flex items-center gap-3 rounded-full border border-line bg-surface py-1.5 pr-5 pl-1.5 transition hover:border-neon-400"
                  >
                    <ArtistAvatar name={artist.stageName} size="sm" />
                    <span className="font-medium">{artist.stageName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </>
  )
}
