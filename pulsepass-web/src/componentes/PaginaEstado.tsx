import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'
import Contenedor from './Contenedor'
import { clasesBoton } from './estilos'
import Tarjeta from './Tarjeta'

interface PropsPaginaEstado {
  codigo: string
  mensaje: string
}

// Plantilla de las páginas 403 y 404.
export default function PaginaEstado({ codigo, mensaje }: PropsPaginaEstado) {
  return (
    <Contenedor ancho="estrecho">
      <Tarjeta className="flex flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-6xl font-extrabold text-neon-400">{codigo}</h1>
        <p>{mensaje}</p>
        <Link to={RUTAS.inicio} className={clasesBoton('primario')}>
          Volver al inicio
        </Link>
      </Tarjeta>
    </Contenedor>
  )
}
