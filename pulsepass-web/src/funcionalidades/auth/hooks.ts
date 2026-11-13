import { useContext } from 'react'
import { AuthContext, type ContextoAuth } from './contexto'

export function useAuth(): ContextoAuth {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
