import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mock, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { TicketResponse } from '../features/tickets/types'
import { myTickets, ticket } from '../test/mocks/data'
import { API, errorBody } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import { renderRoute, sessionWith } from '../test/utils'

const USER = sessionWith('USER')

describe('My tickets', () => {
  it('TEST-FE-TKT-005: lists own tickets using the session email and filters by status', async () => {
    const user = userEvent.setup()
    let requestedEmail: string | null = null
    server.use(
      mock.get(`${API}/tickets/by-user`, ({ request }) => {
        requestedEmail = new URL(request.url).searchParams.get('email')
        return HttpResponse.json(myTickets)
      }),
    )
    const router = renderRoute('/my-tickets', USER)

    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Noche de Jazz y Cultura' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cumbre Tech Caribe 2027' })).toBeInTheDocument()
    expect(requestedEmail).toBe('andrea@pulsepass.test')

    await user.click(screen.getByRole('button', { name: 'Usados' }))
    expect(router.state.location.search).toBe('?status=USED')
    expect(screen.getByRole('button', { name: 'Usados' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Noche de Jazz y Cultura' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Caribbean Music Fest 2026' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Todos' }))
    expect(router.state.location.search).toBe('')
    expect(screen.getByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
  })

  it('an invalid ?status= in the URL falls back to "Todos"', async () => {
    renderRoute('/my-tickets?status=NOPE', USER)
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('TEST-FE-TKT-006: no tickets → empty state with a link to the catalog', async () => {
    server.use(mock.get(`${API}/tickets/by-user`, () => HttpResponse.json([])))
    renderRoute('/my-tickets', USER)
    expect(await screen.findByText('Aún no tienes tickets')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute('href', '/events')
  })

  it('a server error shows a retry action', async () => {
    server.use(mock.get(`${API}/tickets/by-user`, () => errorBody(500, 'boom')))
    renderRoute('/my-tickets', USER)
    expect(await screen.findByRole('alert')).toHaveTextContent('Ocurrió un error inesperado')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('TEST-FE-TKT-010: "Cancelar" only appears on PAID tickets', async () => {
    renderRoute('/my-tickets', USER)
    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
    // 3 tickets (PAID, USED, CANCELLED) → a single cancel button.
    expect(screen.getAllByRole('button', { name: 'Cancelar' })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: 'Ver detalle' })).toHaveLength(3)
  })

  it('TEST-FE-TKT-007: cancelling a PAID ticket refreshes the list', async () => {
    const user = userEvent.setup()
    let cancelled = false
    const current = (): TicketResponse[] =>
      myTickets.map((t) => (cancelled && t.ticketCode === ticket.ticketCode ? { ...t, status: 'CANCELLED' } : t))
    server.use(
      mock.get(`${API}/tickets/by-user`, () => HttpResponse.json(current())),
      mock.patch(`${API}/tickets/:ticketCode/cancel`, () => {
        cancelled = true
        return HttpResponse.json({ ...ticket, status: 'CANCELLED' })
      }),
    )
    renderRoute('/my-tickets', USER)

    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    const dialog = screen.getByRole('dialog', { name: 'Cancelar ticket' })
    expect(dialog).toHaveTextContent('TKT-8F2A1C')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar ticket' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Ticket TKT-8F2A1C cancelado.')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // The invalidated query is fetched again: no PAID ticket is left, so no cancel button.
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument())
  })

  it('TEST-FE-TKT-008: a 409 is shown inside the modal, which stays open', async () => {
    const user = userEvent.setup()
    server.use(
      mock.patch(`${API}/tickets/:ticketCode/cancel`, () =>
        errorBody(409, 'Cannot cancel a ticket after the event date.'),
      ),
    )
    renderRoute('/my-tickets', USER)

    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    const dialog = screen.getByRole('dialog', { name: 'Cancelar ticket' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar ticket' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Cannot cancel a ticket after the event date.')
    expect(screen.getByRole('dialog', { name: 'Cancelar ticket' })).toBeInTheDocument()
  })

  it('STAFF cannot open "Mis tickets" (route for USER only)', async () => {
    const router = renderRoute('/my-tickets', sessionWith('STAFF'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })
})

describe('Ticket detail', () => {
  it('TEST-FE-TKT-004 (detail): shows code, type, price, date and holder', async () => {
    renderRoute('/my-tickets/TKT-8F2A1C', USER)
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('TKT-8F2A1C')).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByText(/250\.000/)).toBeInTheDocument()
    expect(screen.getByText('Andrea Ruiz')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument()
  })

  it('TEST-FE-TKT-009: a ticket from someone else (403) → "Ticket no disponible"', async () => {
    server.use(mock.get(`${API}/tickets/:ticketCode`, () => errorBody(403, 'Forbidden')))
    renderRoute('/my-tickets/TKT-91B07D', USER)
    expect(await screen.findByRole('heading', { name: 'Ticket no disponible' })).toBeInTheDocument()
    expect(screen.queryByText('TKT-91B07D')).not.toBeInTheDocument()
  })

  it('TEST-FE-TKT-009: an unknown ticket (404) → "Ticket no disponible"', async () => {
    renderRoute('/my-tickets/NOPE', USER)
    expect(await screen.findByRole('heading', { name: 'Ticket no disponible' })).toBeInTheDocument()
  })

  it('TEST-FE-TKT-010: a USED ticket has no cancel button', async () => {
    renderRoute('/my-tickets/TKT-5C90E2', USER)
    await screen.findByRole('heading', { name: 'Noche de Jazz y Cultura', level: 1 })
    expect(screen.queryByRole('button', { name: 'Cancelar ticket' })).not.toBeInTheDocument()
  })

  it('cancelling from the detail updates the badge', async () => {
    const user = userEvent.setup()
    renderRoute('/my-tickets/TKT-8F2A1C', USER)

    await user.click(await screen.findByRole('button', { name: 'Cancelar ticket' }))
    const dialog = screen.getByRole('dialog', { name: 'Cancelar ticket' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar ticket' }))

    expect(await screen.findByText('Ticket cancelado.')).toBeInTheDocument()
    expect(screen.getByText('CANCELLED')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar ticket' })).not.toBeInTheDocument()
  })
})

describe('Purchase confirmation', () => {
  it('shows the purchased ticket and links to my tickets', async () => {
    renderRoute('/purchase/confirmation/TKT-8F2A1C', USER)
    expect(await screen.findByRole('heading', { name: '¡Compra realizada con éxito!' })).toBeInTheDocument()
    expect(screen.getByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('TKT-8F2A1C')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver mis tickets' })).toHaveAttribute('href', '/my-tickets')
    expect(screen.getByRole('link', { name: 'Seguir explorando' })).toHaveAttribute('href', '/events')
  })

  it('a ticket that is not yours → "Ticket no disponible"', async () => {
    server.use(mock.get(`${API}/tickets/:ticketCode`, () => errorBody(404, 'Ticket not found.')))
    renderRoute('/purchase/confirmation/TKT-OTHER', USER)
    expect(await screen.findByRole('heading', { name: 'Ticket no disponible' })).toBeInTheDocument()
  })
})
