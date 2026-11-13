import { Navigate, Outlet, useLocation } from 'react-router'
import Container from '../components/Container'
import Loading from '../components/Loading'
import { useAuth } from '../features/auth/hooks'
import type { Role } from '../features/auth/types'
import { ROUTES } from '../lib/routes'

interface RoleRouteProps {
  roles: Role[]
}

export default function RoleRoute({ roles }: RoleRouteProps) {
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
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }
  if (!roles.some((r) => session.user.roles.includes(r))) {
    return <Navigate to={ROUTES.forbidden} replace />
  }
  return <Outlet />
}
