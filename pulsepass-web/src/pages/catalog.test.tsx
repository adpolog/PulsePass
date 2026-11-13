import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mock, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { event } from '../test/mocks/data'
import { API, errorBody } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import { renderRoute, sessionWith } from '../test/utils'

describe('Event catalog', () => {
  it('TEST-FE-EVT-001: lists published events without login', async () => {
    renderRoute('/events')
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Noche de Jazz y Cultura' })).toBeInTheDocument()
    expect(screen.getByText('3 eventos')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-002: empty list → empty state', async () => {
    server.use(mock.get(`${API}/events/published`, () => HttpResponse.json([])))
    renderRoute('/events')
    expect(await screen.findByText('Aún no hay eventos publicados')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-003: text and category filters update the URL', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/events')
    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })

    await user.type(screen.getByLabelText('Buscar por nombre'), 'jazz')
    expect(router.state.location.search).toBe('?q=jazz')
    expect(screen.queryByRole('heading', { name: 'Caribbean Music Fest 2026' })).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText('Buscar por nombre'))
    await user.selectOptions(screen.getByLabelText('Categoría'), 'TECHNOLOGY')
    expect(router.state.location.search).toBe('?category=TECHNOLOGY')
    expect(screen.getByRole('heading', { name: 'Cumbre Tech Caribe 2027' })).toBeInTheDocument()
    expect(screen.getByText('1 evento')).toBeInTheDocument()
  })

  it('filters by artist using the API', async () => {
    renderRoute('/events?artist=Solar%20Beat')
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Noche de Jazz y Cultura' })).not.toBeInTheDocument()
  })

  it('a server error shows a retry action', async () => {
    server.use(mock.get(`${API}/events/published`, () => errorBody(500, 'boom')))
    renderRoute('/events')
    expect(await screen.findByRole('alert')).toHaveTextContent('Ocurrió un error inesperado')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})

describe('Event detail', () => {
  it('TEST-FE-EVT-004: shows event, artists and venue', async () => {
    renderRoute('/events/CMF-2026')
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Edad mínima: 18')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Solar Beat/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Marina Convention Center/ })).toHaveAttribute('href', '/venues/VEN-SMR-01')
  })

  it('TEST-FE-EVT-005: 404 → "Evento no disponible"', async () => {
    renderRoute('/events/DRAFT-01')
    expect(await screen.findByRole('heading', { name: 'Evento no disponible' })).toBeInTheDocument()
  })

  it('TEST-FE-EVT-006: SOLD_OUT event → purchase disabled', async () => {
    server.use(mock.get(`${API}/events/CMF-2026`, () => HttpResponse.json({ ...event, status: 'SOLD_OUT' })))
    renderRoute('/events/CMF-2026', sessionWith('USER'))
    const buttons = await screen.findAllByRole('button', { name: 'No disponible' })
    buttons.forEach((b) => expect(b).toBeDisabled())
    expect(screen.queryByRole('button', { name: 'Comprar entrada' })).not.toBeInTheDocument()
  })

  it('STAFF does not see the purchase panel', async () => {
    renderRoute('/events/CMF-2026', sessionWith('STAFF'))
    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026', level: 1 })
    expect(screen.queryByRole('heading', { name: 'Entradas' })).not.toBeInTheDocument()
  })
})

describe('Artists', () => {
  it('TEST-FE-ART-001: lists active artists', async () => {
    renderRoute('/artists')
    const list = await screen.findByRole('list')
    expect(within(list).getAllByRole('link')).toHaveLength(3)
    expect(within(list).getByText('Neon Waves')).toBeInTheDocument()
  })

  it('TEST-FE-ART-002: artist detail with events', async () => {
    renderRoute('/artists/1')
    expect(await screen.findByRole('heading', { name: 'Solar Beat', level: 1 })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
  })

  it('TEST-FE-ART-003: non-numeric id → 404 without calling the API', async () => {
    let called = false
    server.use(
      mock.get(`${API}/artists/:id`, () => {
        called = true
        return HttpResponse.json({})
      }),
    )
    renderRoute('/artists/abc')
    expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
    expect(called).toBe(false)
  })
})

describe('Venues', () => {
  it('TEST-FE-VEN-001: list, detail and venue 404', async () => {
    renderRoute('/venues')
    expect(await screen.findByRole('heading', { name: 'Marina Convention Center' })).toBeInTheDocument()
  })

  it('shows the venue detail', async () => {
    renderRoute('/venues/VEN-SMR-01')
    expect(await screen.findByRole('heading', { name: 'Marina Convention Center', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('3 personas')).toBeInTheDocument()
  })

  it('unknown venue → 404', async () => {
    renderRoute('/venues/NOPE')
    expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
  })
})

describe('Purchase', () => {
  it('TEST-FE-TKT-002: guest sees a login link that returns to the event', async () => {
    renderRoute('/events/CMF-2026')
    const [link] = await screen.findAllByRole('link', { name: 'Inicia sesión para comprar' })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('TEST-FE-TKT-001/004: valid purchase sends the session email and goes to confirmation', async () => {
    const user = userEvent.setup()
    let body: unknown = null
    server.use(
      mock.post(`${API}/tickets`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          { ...(await import('../test/mocks/data')).ticket, type: 'VIP' },
          { status: 201 },
        )
      }),
    )
    const router = renderRoute('/events/CMF-2026', sessionWith('USER'))
    await user.click(await screen.findByRole('radio', { name: 'VIP' }))
    await user.click(screen.getAllByRole('button', { name: 'Comprar entrada' })[0]!)
    const dialog = screen.getByRole('dialog', { name: 'Confirmar compra' })
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/purchase/confirmation/TKT-8F2A1C'))
    expect(body).toEqual({ userEmail: 'andrea@pulsepass.test', eventCode: 'CMF-2026', type: 'VIP' })
  })

  it('TEST-FE-TKT-003: 409 shows the backend message inside the modal', async () => {
    const user = userEvent.setup()
    server.use(mock.post(`${API}/tickets`, () => errorBody(409, 'El usuario no cumple la edad mínima del evento.')))
    const router = renderRoute('/events/CMF-2026', sessionWith('USER'))
    await user.click((await screen.findAllByRole('button', { name: 'Comprar entrada' }))[0]!)
    const dialog = screen.getByRole('dialog', { name: 'Confirmar compra' })
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('El usuario no cumple la edad mínima del evento.')
    expect(router.state.location.pathname).toBe('/events/CMF-2026')
  })
})
