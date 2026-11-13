import { Link } from 'react-router'
import { IconoMusica } from '../componentes/iconos'
import { RUTAS } from '../lib/rutas'

export default function Logo() {
  return (
    <Link to={RUTAS.inicio} className="flex items-center gap-2 rounded-lg">
      <span className="grid size-8 place-items-center rounded-lg bg-primario text-sobre-primario shadow-neon-sm">
        <IconoMusica className="size-4" />
      </span>
      <span className="font-titulo text-lg font-bold">PulsePass</span>
    </Link>
  )
}
