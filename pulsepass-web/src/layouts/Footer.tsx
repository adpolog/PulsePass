import { Link } from 'react-router'
import { ROUTES } from '../lib/routes'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 font-mono text-xs text-muted sm:flex-row sm:justify-between">
        <p>© 2026 PulsePass · Caso de estudio académico</p>
        <nav aria-label="Pie de página" className="flex gap-4">
          <Link to={ROUTES.venues} className="hover:text-neon-300">
            Sedes
          </Link>
          <Link to={ROUTES.artists} className="hover:text-neon-300">
            Artistas
          </Link>
        </nav>
      </div>
    </footer>
  )
}
