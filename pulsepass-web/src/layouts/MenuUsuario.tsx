import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { IconoChevronAbajo } from '../componentes/iconos'
import { useAuth } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'

const claseItem = 'block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-tinta-800 hover:text-neon-300'

export default function MenuUsuario() {
  const { sesion, tieneRol, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)

  if (sesion.estado !== 'autenticado') return null
  const nombre = sesion.usuario.username

  const salir = () => {
    setAbierto(false)
    cerrarSesion()
    navigate(RUTAS.inicio)
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setAbierto(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setAbierto(false)
      }}
    >
      <button
        type="button"
        aria-expanded={abierto}
        aria-haspopup="menu"
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-borde-fuerte py-1 pr-3 pl-1 text-sm font-medium hover:border-neon-400"
      >
        <span className="grid size-8 place-items-center rounded-full bg-neon-950 text-xs font-bold text-neon-300 uppercase">
          {nombre.charAt(0)}
        </span>
        {nombre}
        <IconoChevronAbajo className="size-4" />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-borde bg-superficie-elevada p-1 shadow-neon-sm">
          <Link to={RUTAS.cuenta} className={claseItem} onClick={() => setAbierto(false)}>
            Mi cuenta
          </Link>
          {tieneRol('USER') && (
            <Link to={RUTAS.misTickets} className={claseItem} onClick={() => setAbierto(false)}>
              Mis tickets
            </Link>
          )}
          <button type="button" className={claseItem} onClick={salir}>
            Salir
          </button>
        </div>
      )}
    </div>
  )
}
