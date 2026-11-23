import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Alert from '../components/Alert'
import CodeSearchForm from '../components/CodeSearchForm'
import Container from '../components/Container'
import { Skeleton } from '../components/Loading'
import PageHeader from '../components/PageHeader'
import { buttonClasses } from '../components/styles'
import { useAuth } from '../features/auth/hooks'
import EventStatusBadge from '../features/events/components/EventStatusBadge'
import { useEvent } from '../features/events/hooks'
import { readRecentEvents } from '../features/events/recentEvents'
import { errorMessage } from '../lib/errors'
import { ROUTES } from '../lib/routes'

// One row per remembered code; each fetches its own event (cached by TanStack Query).
function RecentEventRow({ eventCode }: { eventCode: string }) {
  const event = useEvent(eventCode)
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
      <p className="min-w-0 text-sm">
        <span className="font-mono font-bold">{eventCode}</span>
        {event.isSuccess && <span className="text-muted"> · {event.data.name}</span>}
        {event.isError && <span className="text-muted"> · {errorMessage(event.error)}</span>}
      </p>
      <div className="flex items-center gap-3">
        {event.isPending ? <Skeleton className="h-5 w-20" /> : event.isSuccess && <EventStatusBadge status={event.data.status} />}
        <Link to={ROUTES.adminEvent(eventCode)} className={buttonClasses('secondary', 'min-h-9 px-4')}>
          Gestionar
        </Link>
      </div>
    </li>
  )
}

export default function AdminEvents() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const username = session.status === 'authenticated' ? session.user.username : ''
  const [recent] = useState(() => readRecentEvents(username))

  return (
    <Container width="narrow">
      <PageHeader
        eyebrow="Admin"
        title="Administración de eventos"
        actions={
          <Link to={ROUTES.adminNewEvent} className={buttonClasses('primary')}>
            + Nuevo evento
          </Link>
        }
      />

      <div className="grid gap-8">
        <CodeSearchForm
          label="Buscar evento por código"
          submitLabel="Abrir"
          emptyMessage="Ingresa el código del evento"
          onSearch={(code) => navigate(ROUTES.adminEvent(code))}
        />

        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="mb-3 text-lg font-semibold">
            Creados en esta sesión
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Aún no has creado eventos en esta sesión.</p>
          ) : (
            <ul className="grid gap-3">
              {recent.map((code) => (
                <RecentEventRow key={code} eventCode={code} />
              ))}
            </ul>
          )}
        </section>

        <Alert type="info">Nota: la API no ofrece un listado completo de eventos (GAP-01).</Alert>
      </div>
    </Container>
  )
}
