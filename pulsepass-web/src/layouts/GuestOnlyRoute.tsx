import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../features/auth/hooks'
import { readRedirect } from '../lib/routes'

// Login and register: with an active session go back to where the user came from.
export default function GuestOnlyRoute() {
  const { session } = useAuth()
  const location = useLocation()

  if (session.status === 'authenticated') {
    return <Navigate to={readRedirect(location.state)} replace />
  }
  return <Outlet />
}
