import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router'
import Boton from '../componentes/Boton'
import Contenedor from '../componentes/Contenedor'
import { clasesBoton } from '../componentes/estilos'
import Tarjeta from '../componentes/Tarjeta'
import { esApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'
import SinPermisos from './SinPermisos'

// errorElement: nunca muestra detalles internos ni stack trace.
export default function ErrorPagina() {
  const error = useRouteError()
  const navigate = useNavigate()

  const status = isRouteErrorResponse(error) ? error.status : esApiError(error) ? error.status : null
  if (status === 404) return <NoEncontrada />
  if (status === 403) return <SinPermisos />

  return (
    <Contenedor ancho="estrecho">
      <Tarjeta className="space-y-4">
        <h1 className="text-2xl font-extrabold">¡Ups! Algo salió mal.</h1>
        <p className="text-texto-suave">Ocurrió un error inesperado. Inténtalo más tarde.</p>
        <div className="flex flex-wrap gap-3">
          <Boton onClick={() => navigate(0)}>Reintentar</Boton>
          <Link to={RUTAS.inicio} className={clasesBoton('secundario')}>
            Volver al inicio
          </Link>
        </div>
      </Tarjeta>
    </Contenedor>
  )
}
