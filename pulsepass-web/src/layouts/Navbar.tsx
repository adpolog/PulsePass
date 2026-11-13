import { clsx } from 'clsx'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { clasesBoton } from '../componentes/estilos'
import { IconoCerrar, IconoMenu } from '../componentes/iconos'
import { useAuth } from '../funcionalidades/auth/hooks'
import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'
import Logo from './Logo'
import MenuUsuario from './MenuUsuario'

interface Enlace {
  to: string
  texto: string
  roles?: Rol[]
}

// Tabla 8.4 del PRD: sin `roles` el enlace es público.
const enlaces: Enlace[] = [
  { to: RUTAS.eventos, texto: 'Eventos' },
  { to: RUTAS.artistas, texto: 'Artistas' },
  { to: RUTAS.sedes, texto: 'Sedes' },
  { to: RUTAS.misTickets, texto: 'Mis tickets', roles: ['USER'] },
  { to: RUTAS.validacion, texto: 'Validar ingreso', roles: ['STAFF', 'ADMIN'] },
  { to: RUTAS.ticketsPagados(), texto: 'Tickets pagados', roles: ['STAFF', 'ADMIN'] },
  { to: RUTAS.adminEventos, texto: 'Administrar eventos', roles: ['ADMIN'] },
]

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-neon-950 text-neon-300' : 'text-texto-suave hover:text-white',
  )

export default function Navbar() {
  const { sesion, tieneRol } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const visibles = enlaces.filter((e) => !e.roles || tieneRol(...e.roles))
  const anonimo = sesion.estado !== 'autenticado'
  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-fondo/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            {visibles.map((e) => (
              <NavLink key={e.to} to={e.to} className={claseEnlace}>
                {e.texto}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {anonimo ? (
            <>
              <Link to={RUTAS.login} className={clasesBoton('fantasma')}>
                Ingresar
              </Link>
              <Link to={RUTAS.registro} className={clasesBoton('primario')}>
                Registrarse
              </Link>
            </>
          ) : (
            <MenuUsuario />
          )}
        </div>

        <button
          type="button"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          onClick={() => setMenuAbierto((v) => !v)}
          className="grid size-11 place-items-center rounded-lg hover:bg-tinta-800 md:hidden"
        >
          {menuAbierto ? <IconoCerrar /> : <IconoMenu />}
        </button>
      </div>

      {menuAbierto && (
        <div id="menu-movil" className="border-t border-borde px-4 pb-4 md:hidden">
          <nav aria-label="Principal móvil" className="flex flex-col py-2">
            {visibles.map((e) => (
              <NavLink key={e.to} to={e.to} className={claseEnlace} onClick={cerrarMenu}>
                {e.texto}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-borde pt-4">
            {anonimo ? (
              <div className="flex gap-3">
                <Link to={RUTAS.login} className={clasesBoton('secundario')} onClick={cerrarMenu}>
                  Ingresar
                </Link>
                <Link to={RUTAS.registro} className={clasesBoton('primario')} onClick={cerrarMenu}>
                  Registrarse
                </Link>
              </div>
            ) : (
              <MenuUsuario />
            )}
          </div>
        </div>
      )}
    </header>
  )
}
