import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { alRecibirNoAutorizado, esApiError, establecerToken } from '../../lib/http'
import { login, obtenerUsuarioActual } from './api'
import { AuthContext, type ContextoAuth } from './contexto'
import { SesionGuardadaSchema, type Rol, type Sesion, type SesionGuardada } from './tipos'

const CLAVE_SESION = 'pulsepass.sesion'

function leerSesionGuardada(): SesionGuardada | null {
  try {
    const texto = sessionStorage.getItem(CLAVE_SESION)
    if (!texto) return null
    const resultado = SesionGuardadaSchema.safeParse(JSON.parse(texto))
    if (!resultado.success || resultado.data.expiraEn <= Date.now()) {
      sessionStorage.removeItem(CLAVE_SESION)
      return null
    }
    return resultado.data
  } catch {
    return null
  }
}

function guardarSesion(sesion: SesionGuardada | null) {
  try {
    if (sesion) sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
    else sessionStorage.removeItem(CLAVE_SESION)
  } catch {
    // Sin sessionStorage la sesión solo vive en memoria.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // El token se carga antes del primer render para que las primeras peticiones ya lo lleven.
  const [guardada] = useState(() => {
    const sesionGuardada = leerSesionGuardada()
    establecerToken(sesionGuardada?.token ?? null)
    return sesionGuardada
  })
  const [sesion, setSesion] = useState<Sesion>(
    guardada ? { estado: 'cargando' } : { estado: 'anonimo' },
  )

  const cerrarSesion = useCallback(
    (motivo?: 'expirada') => {
      establecerToken(null)
      guardarSesion(null)
      queryClient.clear()
      setSesion(motivo ? { estado: 'anonimo', motivo } : { estado: 'anonimo' })
    },
    [queryClient],
  )

  useEffect(() => {
    alRecibirNoAutorizado(() => cerrarSesion('expirada'))
  }, [cerrarSesion])

  // Restaurar la sesión al recargar la pestaña.
  useEffect(() => {
    if (!guardada) return
    let cancelado = false
    obtenerUsuarioActual()
      .then((usuario) => {
        if (!cancelado) setSesion({ estado: 'autenticado', ...guardada, usuario })
      })
      .catch((error: unknown) => {
        // El 401 ya lo maneja alNoAutorizado.
        if (!cancelado && !(esApiError(error) && error.status === 401)) cerrarSesion()
      })
    return () => {
      cancelado = true
    }
  }, [guardada, cerrarSesion])

  // Cierre local cuando vence el token.
  const expiraEn = sesion.estado === 'autenticado' ? sesion.expiraEn : null
  useEffect(() => {
    if (expiraEn === null) return
    const id = window.setTimeout(() => cerrarSesion('expirada'), expiraEn - Date.now())
    return () => window.clearTimeout(id)
  }, [expiraEn, cerrarSesion])

  const iniciarSesion = useCallback(async (identifier: string, password: string) => {
    const { accessToken, expiresIn } = await login({ identifier, password })
    const expira = Date.now() + expiresIn * 1000
    establecerToken(accessToken)
    try {
      const usuario = await obtenerUsuarioActual()
      guardarSesion({ token: accessToken, expiraEn: expira })
      setSesion({ estado: 'autenticado', token: accessToken, expiraEn: expira, usuario })
    } catch (error: unknown) {
      establecerToken(null)
      throw error
    }
  }, [])

  const tieneRol = (...roles: Rol[]) =>
    sesion.estado === 'autenticado' && roles.some((r) => sesion.usuario.roles.includes(r))

  const valor: ContextoAuth = {
    sesion,
    iniciarSesion,
    cerrarSesion: () => cerrarSesion(),
    tieneRol,
  }

  return <AuthContext value={valor}>{children}</AuthContext>
}
