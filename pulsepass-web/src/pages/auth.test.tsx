import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mock, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, errorBody } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import { renderApp } from '../test/utils'

const SESSION_KEY = 'pulsepass.session'

describe('Login', () => {
  it('valid credentials store the session and return to state.from', async () => {
    const user = userEvent.setup()
    const router = renderApp('/login', { from: '/account' })

    await user.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
    await user.type(screen.getByLabelText('Contraseña'), 'SuperSecreta123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/account'))
    expect(JSON.parse(sessionStorage.getItem(SESSION_KEY)!)).toMatchObject({ token: 'jwt-token' })
    expect(await screen.findByText('Andrea Ruiz')).toBeInTheDocument()
  })

  it('wrong credentials show a message and keep the user anonymous', async () => {
    const user = userEvent.setup()
    server.use(mock.post(`${API}/auth/login`, () => errorBody(401, 'Invalid credentials')))
    renderApp('/login')

    await user.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
    await user.type(screen.getByLabelText('Contraseña'), 'mala')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.')
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('empty fields are validated before calling the API', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      mock.post(`${API}/auth/login`, () => {
        called = true
        return HttpResponse.json({})
      }),
    )
    renderApp('/login')

    await user.click(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Ingresa tu usuario o correo')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('an expired stored session sends the user to login with a notice', async () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'old', expiresAt: Date.now() + 60_000 }))
    server.use(mock.get(`${API}/auth/me`, () => errorBody(401, 'Token expired')))
    const router = renderApp('/account')

    expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })
})

describe('Register', () => {
  async function fillForm(password = 'SuperSecreta123') {
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Nombres'), 'Andrea')
    await user.type(screen.getByLabelText('Apellidos'), 'Ruiz')
    await user.type(screen.getByLabelText('Usuario'), 'andrea')
    await user.type(screen.getByLabelText('Correo'), 'andrea@pulsepass.test')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '2000-05-10')
    await user.type(screen.getByLabelText('Contraseña'), password)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
  }

  it('a valid form creates the account and goes to login prefilled', async () => {
    let body: unknown = null
    server.use(
      mock.post(`${API}/users`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          { id: 9, username: 'andrea', email: 'andrea@pulsepass.test', firstName: 'Andrea', lastName: 'Ruiz', active: true, birthDate: '2000-05-10' },
          { status: 201 },
        )
      }),
    )
    const router = renderApp('/register')
    await fillForm()

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(body).toEqual({
      username: 'andrea',
      email: 'andrea@pulsepass.test',
      firstName: 'Andrea',
      lastName: 'Ruiz',
      birthDate: '2000-05-10',
      password: 'SuperSecreta123',
    })
    expect(await screen.findByText('Cuenta creada. Ya puedes iniciar sesión.')).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario o correo')).toHaveValue('andrea')
  })

  it('a short password is rejected on the client', async () => {
    renderApp('/register')
    await fillForm('corta')
    expect(await screen.findByText('La contraseña debe tener al menos 12 caracteres')).toBeInTheDocument()
  })

  it('400 details are shown on each field', async () => {
    server.use(mock.post(`${API}/users`, () => errorBody(400, 'Validation failed', { email: 'Invalid email format' })))
    renderApp('/register')
    await fillForm()
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true')
  })

  it('409 shows the backend message', async () => {
    server.use(mock.post(`${API}/users`, () => errorBody(409, 'El correo ya está registrado.')))
    renderApp('/register')
    await fillForm()
    expect(await screen.findByRole('alert')).toHaveTextContent('El correo ya está registrado.')
  })
})

describe('Account', () => {
  it('shows the profile and logs out', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'jwt-token', expiresAt: Date.now() + 60_000 }))
    const router = renderApp('/account')

    expect(await screen.findByText('Andrea Ruiz')).toBeInTheDocument()
    expect(screen.getByText('10 may 2000')).toBeInTheDocument()
    expect(screen.getByText('Cliente')).toBeInTheDocument()
    const shortcuts = screen.getByRole('navigation', { name: 'Accesos rápidos' })
    expect(within(shortcuts).getByRole('link', { name: 'Mis tickets' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  }, 15_000)
})
