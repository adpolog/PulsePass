import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { IconChevronDown } from '../components/icons'
import { useAuth } from '../features/auth/hooks'
import { ROUTES } from '../lib/routes'

const itemClass = 'block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-ink-800 hover:text-neon-300'

export default function UserMenu() {
  const { session, hasRole, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (session.status !== 'authenticated') return null
  const name = session.user.username

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate(ROUTES.home)
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false)
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-line-strong py-1 pr-3 pl-1 text-sm font-medium hover:border-neon-400"
      >
        <span className="grid size-8 place-items-center rounded-full bg-neon-400 font-mono text-xs font-bold text-ink-950 uppercase">
          {name.charAt(0)}
        </span>
        {name}
        <IconChevronDown className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-line bg-surface-raised p-1 shadow-neon-sm">
          <Link to={ROUTES.account} className={itemClass} onClick={() => setOpen(false)}>
            Mi cuenta
          </Link>
          {hasRole('USER') && (
            <Link to={ROUTES.myTickets} className={itemClass} onClick={() => setOpen(false)}>
              Mis tickets
            </Link>
          )}
          <button type="button" className={itemClass} onClick={handleLogout}>
            Salir
          </button>
        </div>
      )}
    </div>
  )
}
