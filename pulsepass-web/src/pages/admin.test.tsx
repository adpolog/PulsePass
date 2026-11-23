import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mock, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { draftEvent } from '../test/mocks/data'
import { API, errorBody } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import { renderRoute, sessionWith } from '../test/utils'

const ADMIN = sessionWith('ADMIN')

async function fillValidForm() {
  const user = userEvent.setup()
  await screen.findByRole('option', { name: 'Marina Convention Center (VEN-SMR-01)' })
  await user.type(screen.getByLabelText('Código del evento'), 'ROCK-2027')
  await user.type(screen.getByLabelText('Nombre'), 'Rock al Parque Caribe')
  await user.type(screen.getByLabelText('Descripción'), 'Bandas de rock de la costa.')
  await user.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
  await user.clear(screen.getByLabelText('Edad mínima'))
  await user.type(screen.getByLabelText('Edad mínima'), '18')
  // jsdom has no picker for datetime-local: the value is set directly.
  fireEvent.change(screen.getByLabelText('Fecha y hora'), { target: { value: '2027-05-01T20:00' } })
  await user.selectOptions(screen.getByLabelText('Sede'), 'VEN-SMR-01')
  return user
}

describe('Admin · create event', () => {
  it('TEST-FE-ADM-001: empty fields show errors and make no request', async () => {
    const user = userEvent.setup()
    let requests = 0
    server.use(
      mock.post(`${API}/events`, () => {
        requests++
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    renderRoute('/admin/events/new', ADMIN)
    await user.click(await screen.findByRole('button', { name: 'Crear evento' }))

    expect(await screen.findByText('Ingresa el código del evento')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el nombre')).toBeInTheDocument()
    expect(screen.getByText('Ingresa la fecha y hora')).toBeInTheDocument()
    expect(screen.getByLabelText('Sede')).toHaveAttribute('aria-invalid', 'true')
    expect(requests).toBe(0)
  })

  it('TEST-FE-ADM-002: valid form → 201, sends the right body and opens the management page', async () => {
    let body: unknown = null
    server.use(
      mock.post(`${API}/events`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          { ...draftEvent, eventCode: 'ROCK-2027', name: 'Rock al Parque Caribe', artists: [] },
          { status: 201 },
        )
      }),
    )
    const router = renderRoute('/admin/events/new', ADMIN)
    const user = await fillValidForm()
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/events/ROCK-2027'))
    expect(body).toEqual({
      eventCode: 'ROCK-2027',
      name: 'Rock al Parque Caribe',
      description: 'Bandas de rock de la costa.',
      category: 'MUSIC',
      eventDate: '2027-05-01T20:00',
      minimumAge: 18,
      venueCode: 'VEN-SMR-01',
    })
    expect(await screen.findByText('Evento creado en estado DRAFT.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rock al Parque Caribe', level: 1 })).toBeInTheDocument()
  })

  it('TEST-FE-ADM-003: a 400 with details puts each message on its field', async () => {
    server.use(
      mock.post(`${API}/events`, () =>
        errorBody(400, 'Validation failed', { name: 'Name must not exceed 150 characters' }),
      ),
    )
    renderRoute('/admin/events/new', ADMIN)
    const user = await fillValidForm()
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findByText('Name must not exceed 150 characters')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('a 409 (duplicate code / past date) is shown above the form', async () => {
    server.use(mock.post(`${API}/events`, () => errorBody(409, 'Event code already exists.')))
    renderRoute('/admin/events/new', ADMIN)
    const user = await fillValidForm()
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Event code already exists.')
  })

  it('a 403 from the API redirects to /403', async () => {
    server.use(mock.post(`${API}/events`, () => errorBody(403, 'Forbidden')))
    const router = renderRoute('/admin/events/new', ADMIN)
    const user = await fillValidForm()
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })

  it('the venue select is filled from GET /api/venues/active', async () => {
    renderRoute('/admin/events/new', ADMIN)
    expect(await screen.findByRole('option', { name: 'Marina Convention Center (VEN-SMR-01)' })).toBeInTheDocument()
    expect(within(screen.getByLabelText('Sede')).getAllByRole('option')).toHaveLength(2) // placeholder + 1 venue
  })
})

describe('Admin · manage event', () => {
  it('shows the DRAFT event with its data, artists and paid-tickets link', async () => {
    renderRoute('/admin/events/EDU-2027', ADMIN)
    expect(await screen.findByRole('heading', { name: 'Taller de Producción Musical', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('DRAFT')).toBeInTheDocument()
    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
    // The navbar also has a "Tickets pagados" link; this one points at the event.
    const links = screen.getAllByRole('link', { name: /Tickets pagados/ })
    expect(links.map((l) => l.getAttribute('href'))).toContain('/staff/events/EDU-2027/tickets')
  })

  it('TEST-FE-ADM-004: publishing a DRAFT event → PUBLISHED badge', async () => {
    const user = userEvent.setup()
    renderRoute('/admin/events/EDU-2027', ADMIN)

    await user.click(await screen.findByRole('button', { name: 'Publicar evento' }))
    const dialog = screen.getByRole('dialog', { name: 'Publicar evento' })
    await user.click(within(dialog).getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByText('Evento publicado. Ya aparece en la cartelera.')).toBeInTheDocument()
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar evento' })).toBeDisabled()
  })

  it('TEST-FE-ADM-005: a 409 when publishing is shown inside the modal', async () => {
    const user = userEvent.setup()
    server.use(
      mock.patch(`${API}/events/:eventCode/publish`, () =>
        errorBody(409, 'El evento debe tener fecha futura para publicarse.'),
      ),
    )
    renderRoute('/admin/events/EDU-2027', ADMIN)

    await user.click(await screen.findByRole('button', { name: 'Publicar evento' }))
    const dialog = screen.getByRole('dialog', { name: 'Publicar evento' })
    await user.click(within(dialog).getByRole('button', { name: 'Publicar' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('El evento debe tener fecha futura para publicarse.')
    expect(screen.getByText('DRAFT')).toBeInTheDocument()
  })

  it('"Publicar evento" is disabled when the event is not DRAFT', async () => {
    renderRoute('/admin/events/CMF-2026', ADMIN)
    expect(await screen.findByRole('button', { name: 'Publicar evento' })).toBeDisabled()
  })

  it('TEST-FE-ADM-006: associating an artist adds it to the list', async () => {
    const user = userEvent.setup()
    renderRoute('/admin/events/EDU-2027', ADMIN)

    const select = await screen.findByLabelText('Agregar artista')
    await screen.findByRole('option', { name: 'Neon Waves' })
    // Solar Beat is already associated, so it is not offered.
    expect(within(select).queryByRole('option', { name: 'Solar Beat' })).not.toBeInTheDocument()

    await user.selectOptions(select, 'Neon Waves')
    await user.click(screen.getByRole('button', { name: '+ Asociar' }))

    expect(await screen.findByText('Artista asociado.')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves', { selector: 'li' })).toBeInTheDocument()
  })

  it('TEST-FE-ADM-006: a duplicate artist → 409 visible', async () => {
    const user = userEvent.setup()
    server.use(
      mock.post(`${API}/events/:eventCode/artists/:artistId`, () =>
        errorBody(409, 'El artista ya está asociado al evento.'),
      ),
    )
    renderRoute('/admin/events/EDU-2027', ADMIN)

    await screen.findByRole('option', { name: 'Neon Waves' })
    await user.selectOptions(screen.getByLabelText('Agregar artista'), 'Neon Waves')
    await user.click(screen.getByRole('button', { name: '+ Asociar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El artista ya está asociado al evento.')
  })

  it('unknown event → "Evento no encontrado"', async () => {
    renderRoute('/admin/events/NOPE', ADMIN)
    expect(await screen.findByRole('heading', { name: 'Evento no encontrado' })).toBeInTheDocument()
  })
})

describe('Admin · events panel', () => {
  it('searching by code opens the management page', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/admin/events', ADMIN)
    await user.type(await screen.findByLabelText('Buscar evento por código'), 'EDU-2027')
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/events/EDU-2027'))
  })

  it('lists the events created in this session', async () => {
    sessionStorage.setItem('pulsepass.admin.recentEvents.andrea', JSON.stringify(['EDU-2027']))
    renderRoute('/admin/events', ADMIN)
    expect(await screen.findByText(/Taller de Producción Musical/)).toBeInTheDocument()
    expect(screen.getByText('DRAFT')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gestionar' })).toHaveAttribute('href', '/admin/events/EDU-2027')
  })

  it('corrupt sessionStorage data is ignored', async () => {
    sessionStorage.setItem('pulsepass.admin.recentEvents.andrea', '{not json')
    renderRoute('/admin/events', ADMIN)
    expect(await screen.findByText('Aún no has creado eventos en esta sesión.')).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-008: a USER is sent to /403', async () => {
    const router = renderRoute('/admin/events', sessionWith('USER'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })

  it('STAFF cannot open the admin panel either', async () => {
    const router = renderRoute('/admin/events/new', sessionWith('STAFF'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })
})
