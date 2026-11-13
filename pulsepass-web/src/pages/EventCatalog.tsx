import { useSearchParams } from 'react-router'
import Button from '../components/Button'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Field from '../components/Field'
import Loading from '../components/Loading'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import { useActiveArtists } from '../features/artists/hooks'
import EventGrid from '../features/events/components/EventGrid'
import { useEventsByArtist, usePublishedEvents } from '../features/events/hooks'
import { EventCategorySchema } from '../features/events/types'
import { errorMessage } from '../lib/errors'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export default function EventCatalog() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = EventCategorySchema.safeParse(params.get('category')).data
  const artist = params.get('artist') ?? undefined

  const published = usePublishedEvents()
  const byArtist = useEventsByArtist(artist)
  const artists = useActiveArtists()
  const query = artist ? byArtist : published

  const updateParam = (key: string, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const events = (query.data ?? []).filter(
    (e) => (!category || e.category === category) && normalize(e.name).includes(normalize(q)),
  )
  const hasFilters = Boolean(q || category || artist)

  return (
    <Container>
      <PageHeader eyebrow="Eventos" title="Cartelera" />

      <div className="mb-6 grid gap-4 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <Field
          label="Buscar por nombre"
          type="search"
          placeholder="Buscar por nombre…"
          value={q}
          onChange={(e) => updateParam('q', e.target.value)}
        />
        <Select label="Categoría" value={category ?? ''} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">Todas</option>
          {EventCategorySchema.options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select label="Artista" value={artist ?? ''} onChange={(e) => updateParam('artist', e.target.value)}>
          <option value="">Todos</option>
          {artists.data?.map((a) => (
            <option key={a.id} value={a.stageName}>
              {a.stageName}
            </option>
          ))}
        </Select>
        <Button variant="secondary" disabled={!hasFilters} onClick={() => setParams({}, { replace: true })}>
          Limpiar
        </Button>
      </div>

      {query.isPending ? (
        <Loading count={6} />
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : events.length === 0 ? (
        <EmptyState message={hasFilters ? 'Sin resultados para tu búsqueda' : 'Aún no hay eventos publicados'} />
      ) : (
        <>
          <p role="status" className="mb-4 font-mono text-xs text-muted">
            {events.length} {events.length === 1 ? 'evento' : 'eventos'}
          </p>
          <EventGrid events={events} />
        </>
      )}
    </Container>
  )
}
