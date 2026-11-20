import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import Alert from '../components/Alert'
import BackLink from '../components/BackLink'
import Button from '../components/Button'
import Card from '../components/Card'
import Container from '../components/Container'
import ErrorState from '../components/ErrorState'
import Loading from '../components/Loading'
import NotAvailable from '../components/NotAvailable'
import PriceCOP from '../components/PriceCOP'
import CancelTicketModal from '../features/tickets/components/CancelTicketModal'
import TicketStatusBadge from '../features/tickets/components/TicketStatusBadge'
import { useTicket } from '../features/tickets/hooks'
import type { TicketResponse } from '../features/tickets/types'
import { errorMessage, isNotAvailable } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import { ROUTES } from '../lib/routes'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  )
}

// QR is out of scope (PRD §9.12): the code is shown as copyable text.
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      // Clipboard can be blocked; the code is still visible on screen.
    }
  }
  return (
    <span className="inline-flex items-center gap-3">
      <span className="font-mono">{code}</span>
      <Button variant="secondary" className="min-h-9 px-3" onClick={() => void copy()}>
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
    </span>
  )
}

function TicketCard({ ticket }: { ticket: TicketResponse }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{ticket.eventName}</h1>
        <TicketStatusBadge status={ticket.status} />
      </div>
      <dl className="mt-6 divide-y divide-line text-sm">
        <Row label="Código">
          <CopyCode code={ticket.ticketCode} />
        </Row>
        <Row label="Evento">
          <Link to={ROUTES.event(ticket.eventCode)} className="font-mono text-neon-400 hover:underline">
            {ticket.eventCode}
          </Link>
        </Row>
        <Row label="Tipo">{ticket.type}</Row>
        <Row label="Precio">
          <PriceCOP value={ticket.price} />
        </Row>
        <Row label="Comprado el">{formatDateTime(ticket.purchaseDate)}</Row>
        <Row label="Titular">{ticket.holderName ?? ticket.userEmail}</Row>
      </dl>
      <p className="mt-4 text-xs text-muted">Presenta este código en el ingreso.</p>
    </Card>
  )
}

export default function TicketDetail() {
  const { ticketCode = '' } = useParams<{ ticketCode: string }>()
  const ticket = useTicket(ticketCode)
  const [confirming, setConfirming] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  if (ticket.isError && isNotAvailable(ticket.error)) {
    return <NotAvailable message="Ticket no disponible" backTo={ROUTES.myTickets} backLabel="Volver a mis tickets" />
  }

  return (
    <Container width="narrow">
      <BackLink to={ROUTES.myTickets}>Mis tickets</BackLink>
      {ticket.isPending ? (
        <Loading message="Cargando ticket…" count={1} className="sm:grid-cols-1 lg:grid-cols-1" />
      ) : ticket.isError ? (
        <ErrorState message={errorMessage(ticket.error)} onRetry={() => void ticket.refetch()} />
      ) : (
        <div className="grid gap-4">
          {cancelled && <Alert type="success">Ticket cancelado.</Alert>}
          <TicketCard ticket={ticket.data} />
          {ticket.data.status === 'PAID' && (
            <div className="flex justify-end">
              <Button
                variant="danger"
                onClick={() => {
                  setCancelled(false)
                  setConfirming(true)
                }}
              >
                Cancelar ticket
              </Button>
            </div>
          )}
          <CancelTicketModal
            ticket={confirming ? ticket.data : null}
            onClose={() => setConfirming(false)}
            onCancelled={() => {
              setConfirming(false)
              setCancelled(true)
            }}
          />
        </div>
      )}
    </Container>
  )
}
