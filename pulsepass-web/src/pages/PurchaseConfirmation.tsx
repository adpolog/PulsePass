import { Link, useParams } from 'react-router'
import Card from '../components/Card'
import Container from '../components/Container'
import ErrorState from '../components/ErrorState'
import Loading from '../components/Loading'
import NotAvailable from '../components/NotAvailable'
import PriceCOP from '../components/PriceCOP'
import { IconCheck } from '../components/icons'
import { buttonClasses } from '../components/styles'
import TicketStatusBadge from '../features/tickets/components/TicketStatusBadge'
import { useTicket } from '../features/tickets/hooks'
import { errorMessage, isNotAvailable } from '../lib/errors'
import { ROUTES } from '../lib/routes'

export default function PurchaseConfirmation() {
  const { ticketCode = '' } = useParams<{ ticketCode: string }>()
  const ticket = useTicket(ticketCode)

  // A ticket from someone else (403) or a made-up code (404) does not reveal anything.
  if (ticket.isError && isNotAvailable(ticket.error)) {
    return <NotAvailable message="Ticket no disponible" backTo={ROUTES.myTickets} backLabel="Ver mis tickets" />
  }

  return (
    <Container width="narrow">
      {ticket.isPending ? (
        <Loading message="Cargando compra…" count={1} className="sm:grid-cols-1 lg:grid-cols-1" />
      ) : ticket.isError ? (
        <ErrorState message={errorMessage(ticket.error)} onRetry={() => void ticket.refetch()} />
      ) : (
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-neon-400 text-ink-950 shadow-neon-sm">
            <IconCheck className="size-7" />
          </span>
          <h1 className="text-2xl font-bold sm:text-3xl">¡Compra realizada con éxito!</h1>
          <div className="space-y-2">
            <p className="text-lg font-semibold">{ticket.data.eventName}</p>
            <p className="text-sm text-muted">
              Ticket <span className="font-mono text-foreground">{ticket.data.ticketCode}</span> · {ticket.data.type} ·{' '}
              <PriceCOP value={ticket.data.price} />
            </p>
            <TicketStatusBadge status={ticket.data.status} />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link to={ROUTES.myTickets} className={buttonClasses('primary')}>
              Ver mis tickets
            </Link>
            <Link to={ROUTES.events} className={buttonClasses('secondary')}>
              Seguir explorando
            </Link>
          </div>
        </Card>
      )}
    </Container>
  )
}
