import { useNavigate, useParams } from 'react-router'
import Alert from '../components/Alert'
import Button from '../components/Button'
import CodeSearchForm from '../components/CodeSearchForm'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Loading from '../components/Loading'
import PageHeader from '../components/PageHeader'
import PriceCOP from '../components/PriceCOP'
import Table, { type TableColumn } from '../components/Table'
import TicketStatusBadge from '../features/tickets/components/TicketStatusBadge'
import { useMarkTicketUsed, usePaidTickets } from '../features/tickets/hooks'
import type { TicketResponse } from '../features/tickets/types'
import { errorMessage } from '../lib/errors'
import { isApiError } from '../lib/http'
import { ROUTES } from '../lib/routes'

export default function PaidTickets() {
  const { eventCode = '' } = useParams<{ eventCode: string }>()
  const navigate = useNavigate()
  const tickets = usePaidTickets(eventCode)
  const use = useMarkTicketUsed()

  const columns: TableColumn<TicketResponse>[] = [
    { header: 'Código', cell: (t) => <span className="font-mono">{t.ticketCode}</span> },
    { header: 'Tipo', cell: (t) => t.type },
    { header: 'Titular', cell: (t) => t.holderName ?? t.userEmail },
    { header: 'Precio', cell: (t) => <PriceCOP value={t.price} /> },
    { header: 'Estado', cell: (t) => <TicketStatusBadge status={t.status} /> },
    {
      header: 'Acción',
      cell: (t) => (
        <Button
          className="min-h-9 px-4"
          aria-label={`Usar ticket ${t.ticketCode}`}
          loading={use.isPending && use.variables === t.ticketCode}
          disabled={use.isPending}
          onClick={() => use.mutate(t.ticketCode)}
        >
          Usar
        </Button>
      ),
    },
  ]

  let content
  if (!eventCode) {
    content = <EmptyState message="Ingresa el código de un evento para ver sus tickets pagados" />
  } else if (tickets.isPending) {
    content = <Loading message="Cargando tickets pagados…" count={2} className="sm:grid-cols-1 lg:grid-cols-1" />
  } else if (tickets.isError) {
    content =
      isApiError(tickets.error) && tickets.error.status === 404 ? (
        <EmptyState message={`No encontramos el evento ${eventCode}`} />
      ) : (
        <ErrorState message={errorMessage(tickets.error)} onRetry={() => void tickets.refetch()} />
      )
  } else if (tickets.data.length === 0) {
    content = <EmptyState message="No hay tickets pagados" />
  } else {
    content = (
      <>
        <p className="mb-3 text-sm text-muted">Total: {tickets.data.length}</p>
        <Table
          title={`Tickets pagados de ${eventCode}`}
          columns={columns}
          rows={tickets.data}
          rowKey={(t) => t.ticketCode}
        />
      </>
    )
  }

  return (
    <Container>
      <PageHeader eyebrow="Staff" title={eventCode ? `Tickets pagados · ${eventCode}` : 'Tickets pagados'} />
      <div className="grid gap-5">
        <div className="max-w-xl">
          <CodeSearchForm
            key={eventCode}
            label="Evento"
            submitLabel="Ir"
            emptyMessage="Ingresa el código del evento"
            defaultValue={eventCode}
            onSearch={(code) => {
              use.reset()
              navigate(ROUTES.paidTickets(code))
            }}
          />
        </div>

        {use.isSuccess && (
          <Alert type="success" onClose={() => use.reset()}>
            Ingreso registrado: <span className="font-mono">{use.data.ticketCode}</span>.
          </Alert>
        )}
        {use.isError && (
          <Alert type={isApiError(use.error) && use.error.status === 409 ? 'warning' : 'error'} onClose={() => use.reset()}>
            {errorMessage(use.error)}
          </Alert>
        )}

        <div>{content}</div>
      </div>
    </Container>
  )
}
