import { clsx } from 'clsx'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Loading from '../components/Loading'
import PageHeader from '../components/PageHeader'
import PriceCOP from '../components/PriceCOP'
import { buttonClasses } from '../components/styles'
import { useAuth } from '../features/auth/hooks'
import CancelTicketModal from '../features/tickets/components/CancelTicketModal'
import TicketStatusBadge from '../features/tickets/components/TicketStatusBadge'
import { useMyTickets } from '../features/tickets/hooks'
import { TicketStatusSchema, type TicketResponse, type TicketStatus } from '../features/tickets/types'
import { errorMessage } from '../lib/errors'
import { formatDate } from '../lib/format'
import { ROUTES } from '../lib/routes'

// PRD DES-06: chips Todos · Pagados · Usados · Cancelados.
const filters: { label: string; status: TicketStatus | null }[] = [
  { label: 'Todos', status: null },
  { label: 'Pagados', status: 'PAID' },
  { label: 'Usados', status: 'USED' },
  { label: 'Cancelados', status: 'CANCELLED' },
]

function TicketCard({ ticket, onCancel }: { ticket: TicketResponse; onCancel: (t: TicketResponse) => void }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{ticket.eventName}</h2>
        <TicketStatusBadge status={ticket.status} />
      </div>
      <p className="mt-1 text-sm text-muted">
        <span className="font-mono text-foreground">{ticket.ticketCode}</span> · {ticket.type} ·{' '}
        <PriceCOP value={ticket.price} /> · {formatDate(ticket.purchaseDate)}
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <Link to={ROUTES.ticket(ticket.ticketCode)} className={buttonClasses('secondary')}>
          Ver detalle
        </Link>
        {/* Only hides the action; the backend still decides (409). */}
        {ticket.status === 'PAID' && (
          <Button variant="danger" onClick={() => onCancel(ticket)}>
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  )
}

export default function MyTickets() {
  const { session } = useAuth()
  const email = session.status === 'authenticated' ? session.user.email : ''
  const tickets = useMyTickets(email)
  const [searchParams, setSearchParams] = useSearchParams()
  const [toCancel, setToCancel] = useState<TicketResponse | null>(null)
  const [cancelledCode, setCancelledCode] = useState<string | null>(null)

  // URL data is external: an unknown ?status= falls back to "Todos".
  const active = TicketStatusSchema.safeParse(searchParams.get('status')).data ?? null

  const selectFilter = (status: TicketStatus | null) => {
    setSearchParams(status ? { status } : {}, { replace: true })
  }

  let content
  if (tickets.isPending) {
    content = <Loading message="Cargando tus tickets…" count={3} className="sm:grid-cols-1 lg:grid-cols-1" />
  } else if (tickets.isError) {
    content = <ErrorState message={errorMessage(tickets.error)} onRetry={() => void tickets.refetch()} />
  } else if (tickets.data.length === 0) {
    content = (
      <EmptyState
        message="Aún no tienes tickets"
        action={
          <Link to={ROUTES.events} className={buttonClasses('secondary')}>
            Ver cartelera
          </Link>
        }
      />
    )
  } else {
    const visible = active ? tickets.data.filter((t) => t.status === active) : tickets.data
    content =
      visible.length === 0 ? (
        <EmptyState message="No tienes tickets con este estado" />
      ) : (
        <ul className="grid gap-4">
          {visible.map((ticket) => (
            <li key={ticket.ticketCode}>
              <TicketCard
                ticket={ticket}
                onCancel={(t) => {
                  setCancelledCode(null)
                  setToCancel(t)
                }}
              />
            </li>
          ))}
        </ul>
      )
  }

  return (
    <Container width="narrow">
      <PageHeader eyebrow="Tickets" title="Mis tickets" />

      <div role="group" aria-label="Filtrar por estado" className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const pressed = active === f.status
          return (
            <button
              key={f.label}
              type="button"
              aria-pressed={pressed}
              onClick={() => selectFilter(f.status)}
              className={clsx(
                'min-h-11 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                pressed
                  ? 'border-neon-400 bg-neon-400 text-ink-950'
                  : 'border-line-strong text-foreground hover:border-neon-400 hover:text-neon-300',
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {cancelledCode && (
        <Alert type="success" onClose={() => setCancelledCode(null)} className="mb-4">
          Ticket <span className="font-mono">{cancelledCode}</span> cancelado.
        </Alert>
      )}

      {content}

      <CancelTicketModal
        ticket={toCancel}
        onClose={() => setToCancel(null)}
        onCancelled={(t) => {
          setToCancel(null)
          setCancelledCode(t.ticketCode)
        }}
      />
    </Container>
  )
}
