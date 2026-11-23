import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { z } from 'zod'
import Alert from '../components/Alert'
import BackLink from '../components/BackLink'
import Button from '../components/Button'
import Card from '../components/Card'
import Container from '../components/Container'
import ErrorState from '../components/ErrorState'
import Loading from '../components/Loading'
import Modal from '../components/Modal'
import NotAvailable from '../components/NotAvailable'
import Select from '../components/Select'
import { IconArrowRight } from '../components/icons'
import { useActiveArtists } from '../features/artists/hooks'
import EventStatusBadge from '../features/events/components/EventStatusBadge'
import { useAddArtist, useEvent, usePublishEvent } from '../features/events/hooks'
import type { EventResponse } from '../features/events/types'
import { errorMessage, isNotAvailable } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import { ROUTES } from '../lib/routes'

const CreatedStateSchema = z.object({ created: z.literal(true) })

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
}

function PublishSection({ event }: { event: EventResponse }) {
  const publish = usePublishEvent()
  const [confirming, setConfirming] = useState(false)

  const close = () => {
    setConfirming(false)
    publish.reset()
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Publicación</h2>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {event.status === 'DRAFT'
            ? 'El evento es visible al público una vez publicado.'
            : `El evento está en estado ${event.status}.`}
        </p>
        {/* UX only: the backend still validates the transition (409). */}
        <Button disabled={event.status !== 'DRAFT'} onClick={() => setConfirming(true)}>
          Publicar evento
        </Button>
      </div>
      {publish.isSuccess && (
        <Alert type="success" className="mt-4" onClose={() => publish.reset()}>
          Evento publicado. Ya aparece en la cartelera.
        </Alert>
      )}

      <Modal
        open={confirming}
        title="Publicar evento"
        onClose={close}
        actions={
          <>
            <Button variant="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button
              loading={publish.isPending}
              onClick={() => publish.mutate(event.eventCode, { onSuccess: () => setConfirming(false) })}
            >
              Publicar
            </Button>
          </>
        }
      >
        <p>
          ¿Publicar <span className="font-semibold">{event.name}</span> (
          <span className="font-mono">{event.eventCode}</span>)? Será visible en la cartelera.
        </p>
        {publish.isError && <Alert type="error">{errorMessage(publish.error)}</Alert>}
      </Modal>
    </Card>
  )
}

function ArtistsSection({ event }: { event: EventResponse }) {
  const artists = useActiveArtists()
  const add = useAddArtist()
  const [selectedId, setSelectedId] = useState('')

  // UX only: already associated artists are not offered (the backend still answers 409).
  const associated = new Set(event.artists.map((a) => a.id))
  const available = artists.data?.filter((a) => !associated.has(a.id)) ?? []
  const selected = available.find((a) => String(a.id) === selectedId)

  const associate = () => {
    if (!selected) return
    add.mutate({ eventCode: event.eventCode, artist: selected }, { onSuccess: () => setSelectedId('') })
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Artistas asociados</h2>
      {event.artists.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Aún no hay artistas asociados.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-3">
          {event.artists.map((artist) => (
            <li key={artist.id} className="flex items-center gap-2 text-sm font-medium">
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-full border border-neon-700 font-mono text-[11px] font-bold text-neon-300"
              >
                {initials(artist.stageName)}
              </span>
              {artist.stageName}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Select
            label="Agregar artista"
            value={selectedId}
            onChange={(e) => {
              add.reset()
              setSelectedId(e.target.value)
            }}
            disabled={artists.isPending || available.length === 0}
            hint={
              artists.isPending
                ? 'Cargando artistas…'
                : available.length === 0 && artists.isSuccess
                  ? 'Todos los artistas activos ya están asociados.'
                  : undefined
            }
            error={artists.isError ? errorMessage(artists.error) : undefined}
          >
            <option value="">Selecciona un artista</option>
            {available.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.stageName}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="secondary"
          className="sm:mt-6"
          disabled={!selected}
          loading={add.isPending}
          onClick={associate}
        >
          + Asociar
        </Button>
      </div>
      {add.isSuccess && (
        <Alert type="success" className="mt-4" onClose={() => add.reset()}>
          Artista asociado.
        </Alert>
      )}
      {add.isError && (
        <Alert type="error" className="mt-4">
          {errorMessage(add.error)}
        </Alert>
      )}
    </Card>
  )
}

export default function AdminManageEvent() {
  const { eventCode = '' } = useParams<{ eventCode: string }>()
  const location = useLocation()
  const event = useEvent(eventCode)
  const justCreated = CreatedStateSchema.safeParse(location.state).success

  if (event.isError && isNotAvailable(event.error)) {
    return <NotAvailable message="Evento no encontrado" backTo={ROUTES.adminEvents} backLabel="Volver a eventos" />
  }

  return (
    <Container width="narrow">
      <BackLink to={ROUTES.adminEvents}>Eventos</BackLink>
      {event.isPending ? (
        <Loading message="Cargando evento…" count={2} className="sm:grid-cols-1 lg:grid-cols-1" />
      ) : event.isError ? (
        <ErrorState message={errorMessage(event.error)} onRetry={() => void event.refetch()} />
      ) : (
        <div className="grid gap-5">
          {justCreated && <Alert type="success">Evento creado en estado DRAFT.</Alert>}

          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold">{event.data.name}</h1>
              <p className="mt-1 text-sm text-muted">
                <span className="font-mono">{event.data.eventCode}</span> · {event.data.category} ·{' '}
                {formatDateTime(event.data.eventDate)}
                {event.data.minimumAge !== null && ` · Mín. ${event.data.minimumAge}`}
                {event.data.venueName && ` · ${event.data.venueName}`}
              </p>
            </div>
            <EventStatusBadge status={event.data.status} />
          </header>

          <PublishSection event={event.data} />
          <ArtistsSection event={event.data} />

          <Link
            to={ROUTES.paidTickets(event.data.eventCode)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neon-400 hover:underline"
          >
            Tickets pagados
            <IconArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </Container>
  )
}
