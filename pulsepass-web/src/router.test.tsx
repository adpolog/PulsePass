import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRuta, sesionCon } from './test/utils'

describe('Guardas de ruta', () => {
  it('TEST-FE-AUTH-007: anónimo en ruta protegida → /login con state.desde', async () => {
    const router = renderRuta('/cuenta')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toEqual({ desde: '/cuenta' })
  })

  it('TEST-FE-AUTH-008: USER en /admin/eventos → /403', async () => {
    const router = renderRuta('/admin/eventos', sesionCon('USER'))
    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/403')
  })

  it('TEST-FE-AUTH-009: ADMIN en /admin/eventos → renderiza', async () => {
    renderRuta('/admin/eventos', sesionCon('ADMIN'))
    expect(
      await screen.findByRole('heading', { name: 'Administración de eventos' }),
    ).toBeInTheDocument()
  })

  it('con sesión, /login redirige al inicio', async () => {
    const router = renderRuta('/login', sesionCon('USER'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})

describe('Transversal', () => {
  it('TEST-FE-GEN-001: ruta inexistente → 404', async () => {
    renderRuta('/no-existe')
    expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
  })

  it('TEST-FE-GEN-003: la navbar muestra enlaces según el rol', async () => {
    renderRuta('/', sesionCon('STAFF'))
    const nav = await screen.findByRole('navigation', { name: 'Principal' })
    expect(within(nav).getByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Mis tickets' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Administrar eventos' })).not.toBeInTheDocument()
  })

  it('anónimo ve Ingresar y Registrarse', async () => {
    renderRuta('/')
    expect(await screen.findAllByRole('link', { name: 'Registrarse' })).not.toHaveLength(0)
    expect(screen.queryByRole('link', { name: 'Mis tickets' })).not.toBeInTheDocument()
  })

  it('TEST-FE-GEN-004: el menú móvil abre y cierra con teclado', async () => {
    const user = userEvent.setup()
    renderRuta('/')
    const boton = await screen.findByRole('button', { name: 'Abrir menú' })
    boton.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('navigation', { name: 'Principal móvil' })).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(screen.queryByRole('navigation', { name: 'Principal móvil' })).not.toBeInTheDocument()
  })
})
