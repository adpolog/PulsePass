import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from '../componentes/Cargando'
import Contenedor from '../componentes/Contenedor'
import { useAuth } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'

// Solo protege la interfaz; la seguridad real la aplica el servidor.
export default function RutaProtegida() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando') {
    return (
      <Contenedor>
        <Cargando mensaje="Verificando sesión…" />
      </Contenedor>
    )
  }
  if (sesion.estado === 'anonimo') {
    return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname + location.search }} />
  }
  return <Outlet />
}
