import { useState } from 'react'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import CodeSearchForm from '../components/CodeSearchForm'
import Container from '../components/Container'
import { Skeleton } from '../components/Loading'
import PageHeader from '../components/PageHeader'
import TicketStatusBadge from '../features/tickets/components/TicketStatusBadge'
import { useMarkTicketUsed, useTicket } from '../features/tickets/hooks'
import type { TicketResponse } from '../features/tickets/types'
import { errorMessage } from '../lib/errors'
import { isApiError } from '../lib/http'

function lookupError(error: unknown): string {
  if (isApiError(error) && error.status === 404) return 'Ticket no encontrado.'
  return errorMessage(error)
}

function resultMessageFor(use: ReturnType<typeof useMarkTicketUsed>) {
  if (use.isSuccess) return <Alert type="success">Ingreso registrado.</Alert>
  if (!use.isError) return null
  // 409 = business rule (already used, cancelled…): warning tone with the backend message.
  if (isApiError(use.error) && use.error.status === 409) return <Alert type="warning">{errorMessage(use.error)}</Alert>
  return <Alert type="error">{errorMessage(use.error)}</Alert>
}

interface TicketResultProps {
  ticket: TicketResponse
  marking: boolean
  showNotice: boolean
  onMark: () => void
}

function TicketResult({ ticket, marking, showNotice, onMark }: TicketResultProps) {
  return (
    <Card aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">{ticket.eventName}</h2>
          <p className="mt-1 text-base text-muted">
            {ticket.type} · Titular: <span className="text-foreground">{ticket.holderName ?? ticket.userEmail}</span>
          </p>
          <p className="mt-1 font-mono text-sm text-muted">{ticket.ticketCode}</p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>
      {ticket.status === 'PAID' ? (
        <Button className="mt-5 min-h-14 w-full text-base" loading={marking} onClick={onMark}>
          Marcar como usado
        </Button>
      ) : (
        showNotice && (
          <p className="mt-4 text-sm text-muted">Este ticket no está habilitado para el ingreso.</p>
        )
      )}
    </Card>
  )
}

export default function CheckIn() {
  const [code, setCode] = useState('')
  // Changing the key remounts the form: clears and re-focuses the field.
  const [formKey, setFormKey] = useState(0)
  const ticket = useTicket(code)
  const use = useMarkTicketUsed()
  const resultMessage = resultMessageFor(use)

  const search = (value: string) => {
    use.reset()
    setCode(value)
    // Searching the same code again must show the current state, not the cached one.
    if (value === code) void ticket.refetch()
  }

  const mark = () => {
    if (!ticket.data) return
    use.mutate(ticket.data.ticketCode, { onSuccess: () => setFormKey((k) => k + 1) })
  }

  let result = null
  if (code) {
    if (ticket.isPending) {
      result = (
        <div aria-busy="true" className="rounded-2xl border border-line bg-surface p-6">
          <span className="sr-only" role="status">
            Buscando ticket…
          </span>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/3" />
        </div>
      )
    } else if (ticket.isError) {
      result = <Alert type="error">{lookupError(ticket.error)}</Alert>
    } else {
      result = (
        <TicketResult
          ticket={ticket.data}
          marking={use.isPending}
          showNotice={resultMessage === null}
          onMark={mark}
        />
      )
    }
  }

  return (
    <Container width="narrow">
      <PageHeader eyebrow="Staff" title="Validación de ingreso" />
      <div className="grid gap-5">
        <CodeSearchForm
          key={formKey}
          label="Código de ticket"
          submitLabel="Buscar"
          emptyMessage="Ingresa el código del ticket"
          autoFocus
          onSearch={search}
        />
        {result}
        {code && resultMessage}
      </div>
    </Container>
  )
}
