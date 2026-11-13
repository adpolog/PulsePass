import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../funcionalidades/auth/hooks'
import { leerDesde } from '../lib/rutas'

// Login y registro: con sesión activa se vuelve a la ruta de origen (o al inicio).
export default function SoloAnonimo() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'autenticado') {
    return <Navigate to={leerDesde(location.state)} replace />
  }
  return <Outlet />
}
