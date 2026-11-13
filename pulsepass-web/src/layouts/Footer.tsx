import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function Footer() {
  return (
    <footer className="border-t border-borde">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-texto-suave sm:flex-row sm:justify-between">
        <p>© 2026 PulsePass · Caso de estudio académico</p>
        <nav aria-label="Pie de página" className="flex gap-4">
          <Link to={RUTAS.sedes} className="hover:text-neon-300">
            Sedes
          </Link>
          <Link to={RUTAS.artistas} className="hover:text-neon-300">
            Artistas
          </Link>
        </nav>
      </div>
    </footer>
  )
}
