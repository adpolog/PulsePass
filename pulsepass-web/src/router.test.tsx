import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute, sessionWith } from './test/utils'

describe('Route guards', () => {
  it('TEST-FE-AUTH-007: guest on a protected route → /login with state.from', async () => {
    const router = renderRoute('/account')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toEqual({ from: '/account' })
  })

  it('TEST-FE-AUTH-008: USER on /admin/events → /403', async () => {
    const router = renderRoute('/admin/events', sessionWith('USER'))
    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/403')
  })

  it('TEST-FE-AUTH-009: ADMIN on /admin/events → renders', async () => {
    renderRoute('/admin/events', sessionWith('ADMIN'))
    expect(await screen.findByRole('heading', { name: 'Administración de eventos' })).toBeInTheDocument()
  })

  it('with a session, /login redirects home', async () => {
    const router = renderRoute('/login', sessionWith('USER'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})

describe('Cross-cutting', () => {
  it('TEST-FE-GEN-001: unknown route → 404', async () => {
    renderRoute('/does-not-exist')
    expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
  })

  it('TEST-FE-GEN-003: navbar shows links by role', async () => {
    renderRoute('/', sessionWith('STAFF'))
    const nav = await screen.findByRole('navigation', { name: 'Principal' })
    expect(within(nav).getByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Mis tickets' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Administrar eventos' })).not.toBeInTheDocument()
  })

  it('TEST-FE-GEN-004: the mobile menu opens and closes with the keyboard', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    const button = await screen.findByRole('button', { name: 'Abrir menú' })
    button.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('navigation', { name: 'Principal móvil' })).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(screen.queryByRole('navigation', { name: 'Principal móvil' })).not.toBeInTheDocument()
  })
})
