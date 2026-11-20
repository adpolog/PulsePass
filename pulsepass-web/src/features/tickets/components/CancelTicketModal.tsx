import Alert from '../../../components/Alert'
import Button from '../../../components/Button'
import Modal from '../../../components/Modal'
import { errorMessage } from '../../../lib/errors'
import { useCancelTicket } from '../hooks'
import type { TicketResponse } from '../types'

interface CancelTicketModalProps {
  // null keeps the modal closed.
  ticket: TicketResponse | null
  onClose: () => void
  onCancelled: (ticket: TicketResponse) => void
}

// PRD §9.11: a 409 (ticket used / not cancellable) is shown inside the modal without closing it.
export default function CancelTicketModal({ ticket, onClose, onCancelled }: CancelTicketModalProps) {
  const cancel = useCancelTicket()

  const close = () => {
    cancel.reset()
    onClose()
  }

  const confirm = () => {
    if (!ticket) return
    cancel.mutate(ticket, {
      onSuccess: (updated) => {
        cancel.reset()
        onCancelled(updated)
      },
    })
  }

  return (
    <Modal
      open={ticket !== null}
      title="Cancelar ticket"
      onClose={close}
      actions={
        <>
          <Button variant="secondary" onClick={close}>
            Volver
          </Button>
          <Button variant="danger" onClick={confirm} loading={cancel.isPending}>
            Cancelar ticket
          </Button>
        </>
      }
    >
      {ticket && (
        <p className="text-sm">
          ¿Quieres cancelar el ticket <span className="font-mono font-bold">{ticket.ticketCode}</span> ({ticket.type}) de{' '}
          {ticket.eventName}?
        </p>
      )}
      {cancel.isError && <Alert type="error">{errorMessage(cancel.error)}</Alert>}
    </Modal>
  )
}
