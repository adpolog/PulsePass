import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { ROUTES } from '../../lib/routes'
import { AuthContext, type AuthContextValue } from './context'

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}

// Leaves the protected page first, so the guard does not send the user to /login.
export function useSignOut() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return async () => {
    await navigate(ROUTES.home)
    logout()
  }
}
