import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { isApiError, onUnauthorized, setAuthToken } from '../../lib/http'
import { fetchCurrentUser, login as loginRequest } from './api'
import { AuthContext, type AuthContextValue } from './context'
import { StoredSessionSchema, type Role, type Session, type StoredSession } from './types'

const SESSION_KEY = 'pulsepass.session'

function readStoredSession(): StoredSession | null {
  try {
    const text = sessionStorage.getItem(SESSION_KEY)
    if (!text) return null
    const result = StoredSessionSchema.safeParse(JSON.parse(text))
    if (!result.success || result.data.expiresAt <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return result.data
  } catch {
    return null
  }
}

function storeSession(session: StoredSession | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Without sessionStorage the session only lives in memory.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // The token is loaded before the first render so the first requests already carry it.
  const [stored] = useState(() => {
    const saved = readStoredSession()
    setAuthToken(saved?.token ?? null)
    return saved
  })
  const [session, setSession] = useState<Session>(stored ? { status: 'loading' } : { status: 'anonymous' })

  const logout = useCallback(
    (reason?: 'expired') => {
      setAuthToken(null)
      storeSession(null)
      queryClient.clear()
      setSession(reason ? { status: 'anonymous', reason } : { status: 'anonymous' })
    },
    [queryClient],
  )

  useEffect(() => {
    onUnauthorized(() => logout('expired'))
  }, [logout])

  // Restore the session after a page reload.
  useEffect(() => {
    if (!stored) return
    let cancelled = false
    fetchCurrentUser()
      .then((user) => {
        if (!cancelled) setSession({ status: 'authenticated', ...stored, user })
      })
      .catch((error: unknown) => {
        // A 401 is already handled by onUnauthorized.
        if (!cancelled && !(isApiError(error) && error.status === 401)) logout()
      })
    return () => {
      cancelled = true
    }
  }, [stored, logout])

  // Local logout when the token expires.
  const expiresAt = session.status === 'authenticated' ? session.expiresAt : null
  useEffect(() => {
    if (expiresAt === null) return
    const id = window.setTimeout(() => logout('expired'), expiresAt - Date.now())
    return () => window.clearTimeout(id)
  }, [expiresAt, logout])

  const login = useCallback(async (identifier: string, password: string) => {
    const { accessToken, expiresIn } = await loginRequest({ identifier, password })
    const expires = Date.now() + expiresIn * 1000
    setAuthToken(accessToken)
    try {
      const user = await fetchCurrentUser()
      storeSession({ token: accessToken, expiresAt: expires })
      setSession({ status: 'authenticated', token: accessToken, expiresAt: expires, user })
    } catch (error: unknown) {
      setAuthToken(null)
      throw error
    }
  }, [])

  const hasRole = (...roles: Role[]) =>
    session.status === 'authenticated' && roles.some((r) => session.user.roles.includes(r))

  const value: AuthContextValue = {
    session,
    login,
    logout: () => logout(),
    hasRole,
  }

  return <AuthContext value={value}>{children}</AuthContext>
}
