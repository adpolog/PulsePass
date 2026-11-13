import { Navigate, Outlet, useLocation } from 'react-router'
import Container from '../components/Container'
import Loading from '../components/Loading'
import { useAuth } from '../features/auth/hooks'
import { ROUTES } from '../lib/routes'

// UI-only guard: the server is the real security boundary.
export default function ProtectedRoute() {
  const { session } = useAuth()
  const location = useLocation()

  if (session.status === 'loading') {
    return (
      <Container>
        <Loading message="Verificando sesión…" />
      </Container>
    )
  }
  if (session.status === 'anonymous') {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}
