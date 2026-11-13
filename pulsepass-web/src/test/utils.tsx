import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { vi } from 'vitest'
import { AuthContext, type ContextoAuth } from '../funcionalidades/auth/contexto'
import type { Rol, Sesion } from '../funcionalidades/auth/tipos'
import { rutas } from '../router'

export function sesionCon(...roles: Rol[]): Sesion {
  return {
    estado: 'autenticado',
    token: 'token-de-prueba',
    expiraEn: Date.now() + 900_000,
    usuario: { id: 1, username: 'andrea', email: 'andrea@pulsepass.test', roles },
  }
}

// Renderiza la app completa en una ruta, con una sesión simulada.
export function renderRuta(ruta: string, sesion: Sesion = { estado: 'anonimo' }) {
  const router = createMemoryRouter(rutas, { initialEntries: [ruta] })
  const auth: ContextoAuth = {
    sesion,
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    tieneRol: (...roles) =>
      sesion.estado === 'autenticado' && roles.some((r) => sesion.usuario.roles.includes(r)),
  }
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext value={auth}>
        <RouterProvider router={router} />
      </AuthContext>
    </QueryClientProvider>,
  )
  return router
}
