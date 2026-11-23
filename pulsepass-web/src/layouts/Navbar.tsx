import { clsx } from 'clsx'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { IconClose, IconMenu } from '../components/icons'
import { buttonClasses } from '../components/styles'
import { useAuth } from '../features/auth/hooks'
import type { Role } from '../features/auth/types'
import { ROUTES } from '../lib/routes'
import Logo from './Logo'
import UserMenu from './UserMenu'

interface NavItem {
  to: string
  label: string
  roles?: Role[]
}

const navItems: NavItem[] = [
  { to: ROUTES.events, label: 'Eventos' },
  { to: ROUTES.artists, label: 'Artistas' },
  { to: ROUTES.venues, label: 'Sedes' },
  { to: ROUTES.myTickets, label: 'Mis tickets', roles: ['USER'] },
  { to: ROUTES.checkIn, label: 'Validar ingreso', roles: ['STAFF', 'ADMIN'] },
  { to: ROUTES.paidTickets(), label: 'Tickets pagados', roles: ['STAFF', 'ADMIN'] },
  { to: ROUTES.adminEvents, label: 'Administrar eventos', roles: ['ADMIN'] },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-full px-3 py-1.5 text-sm font-medium transition',
    isActive ? 'bg-neon-400 text-ink-950' : 'text-muted hover:text-white',
  )

export default function Navbar() {
  const { session, hasRole } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const visible = navItems.filter((item) => !item.roles || hasRole(...item.roles))
  const isGuest = session.status !== 'authenticated'
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto max-w-6xl rounded-2xl border border-line bg-surface/80 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Logo />
            <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
              {visible.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isGuest ? (
              <>
                <Link to={ROUTES.login} className={buttonClasses('ghost')}>
                  Ingresar
                </Link>
                <Link to={ROUTES.register} className={buttonClasses('primary')}>
                  Registrarse
                </Link>
              </>
            ) : (
              <UserMenu />
            )}
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-full hover:bg-ink-800 md:hidden"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-line px-4 pb-4 md:hidden">
            <nav aria-label="Principal móvil" className="flex flex-col gap-1 py-3">
              {visible.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={closeMenu}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-line pt-4">
              {isGuest ? (
                <div className="flex gap-3">
                  <Link to={ROUTES.login} className={buttonClasses('secondary')} onClick={closeMenu}>
                    Ingresar
                  </Link>
                  <Link to={ROUTES.register} className={buttonClasses('primary')} onClick={closeMenu}>
                    Registrarse
                  </Link>
                </div>
              ) : (
                <UserMenu />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
