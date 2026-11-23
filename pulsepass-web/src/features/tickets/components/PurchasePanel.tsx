import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import Alert from '../../../components/Alert'
import Button from '../../../components/Button'
import Modal from '../../../components/Modal'
import { buttonClasses } from '../../../components/styles'
import { errorMessage } from '../../../lib/errors'
import { ROUTES } from '../../../lib/routes'
import { useAuth } from '../../auth/hooks'
import type { EventResponse } from '../../events/types'
import { useBuyTicket } from '../hooks'
import { PurchaseFormSchema, TicketTypeSchema, type PurchaseForm } from '../types'

const FORM_ID = 'purchase-form'

export default function PurchasePanel({ event }: { event: EventResponse }) {
  const { session, hasRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const buy = useBuyTicket()
  const [confirming, setConfirming] = useState(false)
  const { register, handleSubmit, control } = useForm<PurchaseForm>({
    resolver: zodResolver(PurchaseFormSchema),
    defaultValues: { type: 'GENERAL' },
  })
  const selectedType = useWatch({ control, name: 'type' })

  // STAFF and ADMIN do not buy from the UI (PRD 12.4). UX only: the API itself only lets
  // anyone buy with their own email (canPurchaseTicket), never on behalf of someone else.
  if (hasRole('STAFF', 'ADMIN') && !hasRole('USER')) return null

  const available = event.status === 'PUBLISHED'

  const openConfirmation = () => {
    buy.reset()
    setConfirming(true)
  }

  const confirm = () => {
    if (session.status !== 'authenticated') return
    buy.mutate(
      { userEmail: session.user.email, eventCode: event.eventCode, type: selectedType },
      { onSuccess: (ticket) => navigate(ROUTES.purchaseConfirmation(ticket.ticketCode)) },
    )
  }

  let action: ReactNode
  if (!available) {
    action = (
      <Button disabled className="w-full">
        No disponible
      </Button>
    )
  } else if (session.status !== 'authenticated') {
    action = (
      <Link
        to={ROUTES.login}
        state={{ from: location.pathname }}
        className={buttonClasses('primary', 'w-full')}
      >
        Inicia sesión para comprar
      </Link>
    )
  } else {
    action = (
      <Button type="submit" form={FORM_ID} className="w-full">
        Comprar entrada
      </Button>
    )
  }

  return (
    <>
      <section aria-labelledby="tickets-title" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 id="tickets-title" className="text-lg font-semibold">
          Entradas
        </h2>
        <form id={FORM_ID} onSubmit={handleSubmit(openConfirmation)} className="mt-4 space-y-2">
          <fieldset disabled={!available} className="space-y-2">
            <legend className="mb-2 font-mono text-[11px] tracking-wider text-muted uppercase">Tipo de entrada</legend>
            {TicketTypeSchema.options.map((type) => (
              <label
                key={type}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line px-4 text-sm font-medium transition has-checked:border-neon-400 has-checked:bg-neon-950 has-disabled:cursor-not-allowed has-disabled:opacity-60"
              >
                <input type="radio" value={type} {...register('type')} className="accent-neon-400" />
                {type}
              </label>
            ))}
          </fieldset>
        </form>
        <div className="mt-5 hidden md:block">{action}</div>
        <p className="mt-3 text-xs text-muted">
          {available ? 'El precio lo define el sistema al confirmar.' : `Este evento está ${event.status}.`}
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 backdrop-blur md:hidden">
        {action}
      </div>

      <Modal
        open={confirming}
        title="Confirmar compra"
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
            <Button onClick={confirm} loading={buy.isPending}>
              Confirmar
            </Button>
          </>
        }
      >
        <dl className="divide-y divide-line">
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-muted">Evento</dt>
            <dd className="text-right font-medium">{event.name}</dd>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-muted">Tipo</dt>
            <dd className="font-mono font-bold">{selectedType}</dd>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-muted">Cuenta</dt>
            <dd className="text-right">{session.status === 'authenticated' ? session.user.email : ''}</dd>
          </div>
        </dl>
        {buy.isError && <Alert type="error">{errorMessage(buy.error)}</Alert>}
      </Modal>
    </>
  )
}
