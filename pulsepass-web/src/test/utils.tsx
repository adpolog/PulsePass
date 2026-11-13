import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../features/auth/context'
import type { Role, Session } from '../features/auth/types'
import { routes } from '../router'

export function sessionWith(...roles: Role[]): Session {
  return {
    status: 'authenticated',
    token: 'test-token',
    expiresAt: Date.now() + 900_000,
    user: { id: 1, username: 'andrea', email: 'andrea@pulsepass.test', roles },
  }
}

// Renders the whole app at a route with a fake session; the API is mocked by MSW.
export function renderRoute(path: string, session: Session = { status: 'anonymous' }) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const auth: AuthContextValue = {
    session,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: (...roles: Role[]) =>
      session.status === 'authenticated' && roles.some((r) => session.user.roles.includes(r)),
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
