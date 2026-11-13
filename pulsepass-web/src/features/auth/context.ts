import { createContext } from 'react'
import type { Role, Session } from './types'

export interface AuthContextValue {
  session: Session
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
