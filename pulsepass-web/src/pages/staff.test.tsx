import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mock, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { myTickets, paidTickets, ticket } from '../test/mocks/data'
import { API, errorBody } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import { renderRoute, sessionWith } from '../test/utils'

const STAFF = sessionWith('STAFF')

async function searchTicket(code: string) {
  const user = userEvent.setup()
  const field = await screen.findByLabelText('Código de ticket')
  await user.clear(field)
  if (code) await user.type(field, code)
  await user.click(screen.getByRole('button', { name: 'Buscar' }))
  return user
}

describe('Check-in', () => {
  it('the code field is focused on arrival', async () => {
    renderRoute('/staff/check-in', STAFF)
    expect(await screen.findByLabelText('Código de ticket')).toHaveFocus()
  })

  it('TEST-FE-STF-001: search and mark as used → success, USED badge and a clean field', async () => {
    renderRoute('/staff/check-in', STAFF)
    const user = await searchTicket('TKT-8F2A1C')

    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.getByText('Andrea Ruiz')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Marcar como usado' }))

    expect(await screen.findByText('Ingreso registrado.')).toBeInTheDocument()
    expect(screen.getByText('USED')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar como usado' })).not.toBeInTheDocument()
    const field = screen.getByLabelText('Código de ticket')
    expect(field).toHaveValue('')
    expect(field).toHaveFocus()
  })

  it('TEST-FE-STF-002: a ticket already used at another door → 409 warning and real state reloaded', async () => {
    let lookups = 0
    server.use(
      // First lookup sees PAID; after the 409 the page reloads and sees USED.
      mock.get(`${API}/tickets/:ticketCode`, () =>
        HttpResponse.json({ ...ticket, status: lookups++ === 0 ? 'PAID' : 'USED' }),
      ),
      mock.patch(`${API}/tickets/:ticketCode/use`, () => errorBody(409, 'El ticket ya fue utilizado.')),
    )
    renderRoute('/staff/check-in', STAFF)
    const user = await searchTicket('TKT-8F2A1C')
    await user.click(await screen.findByRole('button', { name: 'Marcar como usado' }))

    expect(await screen.findByText('El ticket ya fue utilizado.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('USED')).toBeInTheDocument())
  })

  it('TEST-FE-STF-003: unknown ticket → "Ticket no encontrado."', async () => {
    renderRoute('/staff/check-in', STAFF)
    await searchTicket('NOPE')
    expect(await screen.findByRole('alert')).toHaveTextContent('Ticket no encontrado.')
  })

  it('a 403 from the API → permissions message', async () => {
    server.use(mock.get(`${API}/tickets/:ticketCode`, () => errorBody(403, 'Forbidden')))
    renderRoute('/staff/check-in', STAFF)
    await searchTicket('TKT-8F2A1C')
    expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permisos')
  })

  it('an empty code shows a field error and makes no request', async () => {
    let requests = 0
    server.use(
      mock.get(`${API}/tickets/:ticketCode`, () => {
        requests++
        return HttpResponse.json(ticket)
      }),
    )
    renderRoute('/staff/check-in', STAFF)
    await searchTicket('')
    expect(await screen.findByText('Ingresa el código del ticket')).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it('a ticket that is not PAID has no check-in button', async () => {
    renderRoute('/staff/check-in', STAFF)
    await searchTicket(myTickets[2]!.ticketCode) // CANCELLED
    expect(await screen.findByText('Este ticket no está habilitado para el ingreso.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar como usado' })).not.toBeInTheDocument()
  })

  it('ADMIN can also open check-in', async () => {
    renderRoute('/staff/check-in', sessionWith('ADMIN'))
    expect(await screen.findByRole('heading', { name: 'Validación de ingreso' })).toBeInTheDocument()
  })

  it('USER cannot open check-in', async () => {
    const router = renderRoute('/staff/check-in', sessionWith('USER'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })
})

describe('Paid tickets by event', () => {
  it('TEST-FE-STF-004: table with the paid tickets of the event', async () => {
    renderRoute('/staff/events/CMF-2026/tickets', STAFF)
    expect(await screen.findByRole('heading', { name: 'Tickets pagados · CMF-2026' })).toBeInTheDocument()
    expect(await screen.findByText('Total: 2')).toBeInTheDocument()

    const table = screen.getByRole('table', { name: 'Tickets pagados de CMF-2026' })
    expect(within(table).getAllByRole('row')).toHaveLength(3) // header + 2 rows
    expect(within(table).getByText('Carlos Peña')).toBeInTheDocument()
    expect(within(table).getByText('TKT-91B07D')).toBeInTheDocument()
  })

  it('"Usar" marks the ticket and reloads the list', async () => {
    const user = userEvent.setup()
    let used = false
    server.use(
      mock.get(`${API}/events/:eventCode/tickets/paid`, () =>
        HttpResponse.json(used ? paidTickets.slice(1) : paidTickets),
      ),
      mock.patch(`${API}/tickets/:ticketCode/use`, () => {
        used = true
        return HttpResponse.json({ ...ticket, status: 'USED' })
      }),
    )
    renderRoute('/staff/events/CMF-2026/tickets', STAFF)

    const table = await screen.findByRole('table')
    await user.click(within(table).getByRole('button', { name: 'Usar ticket TKT-8F2A1C' }))

    expect(await screen.findByText(/Ingreso registrado/)).toHaveTextContent('TKT-8F2A1C')
    await waitFor(() => expect(screen.getByText('Total: 1')).toBeInTheDocument())
  })

  it('"Usar" with a 409 shows the backend message', async () => {
    const user = userEvent.setup()
    server.use(mock.patch(`${API}/tickets/:ticketCode/use`, () => errorBody(409, 'El ticket ya fue utilizado.')))
    renderRoute('/staff/events/CMF-2026/tickets', STAFF)

    const table = await screen.findByRole('table')
    await user.click(within(table).getByRole('button', { name: 'Usar ticket TKT-91B07D' }))
    expect(await screen.findByText('El ticket ya fue utilizado.')).toBeInTheDocument()
  })

  it('unknown event → "No encontramos el evento"', async () => {
    renderRoute('/staff/events/NOPE/tickets', STAFF)
    expect(await screen.findByText('No encontramos el evento NOPE')).toBeInTheDocument()
  })

  it('no paid tickets → empty state', async () => {
    server.use(mock.get(`${API}/events/:eventCode/tickets/paid`, () => HttpResponse.json([])))
    renderRoute('/staff/events/CMF-2026/tickets', STAFF)
    expect(await screen.findByText('No hay tickets pagados')).toBeInTheDocument()
  })

  it('without an event code it asks for one and the search navigates', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/staff/events/tickets', STAFF)
    expect(await screen.findByText(/Ingresa el código de un evento/)).toBeInTheDocument()

    await user.type(screen.getByLabelText('Evento'), 'CMF-2026')
    await user.click(screen.getByRole('button', { name: 'Ir' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/staff/events/CMF-2026/tickets'))
    expect(await screen.findByText('Total: 2')).toBeInTheDocument()
  })
})
