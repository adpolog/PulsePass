import { Link } from 'react-router'
import { ROUTES } from '../lib/routes'
import Container from './Container'
import { buttonClasses } from './styles'

interface StatusPageProps {
  code: string
  message: string
}

// Shared layout for the 403 and 404 pages.
export default function StatusPage({ code, message }: StatusPageProps) {
  return (
    <Container width="narrow" className="flex flex-col items-center gap-5 py-20 text-center">
      <p className="font-mono text-8xl font-bold text-neon-400 drop-shadow-[0_0_24px_rgb(57_255_20/0.45)]">
        {code}
      </p>
      <p className="text-lg">{message}</p>
      <Link to={ROUTES.home} className={buttonClasses('primary')}>
        Volver al inicio
      </Link>
    </Container>
  )
}
