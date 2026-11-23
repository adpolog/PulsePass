import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router'
import Button from '../components/Button'
import Card from '../components/Card'
import Container from '../components/Container'
import { buttonClasses } from '../components/styles'
import { isApiError } from '../lib/http'
import { ROUTES } from '../lib/routes'
import Forbidden from './Forbidden'
import NotFound from './NotFound'

// Route errorElement: never shows internal details or stack traces.
export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  const status = isRouteErrorResponse(error) ? error.status : isApiError(error) ? error.status : null
  if (status === 404) return <NotFound />
  if (status === 403) return <Forbidden />

  return (
    <Container width="narrow">
      <Card className="space-y-4">
        <h1 className="text-2xl font-bold">¡Ups! Algo salió mal.</h1>
        <p className="text-muted">Ocurrió un error inesperado. Inténtalo más tarde.</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(0)}>Reintentar</Button>
          <Link to={ROUTES.home} className={buttonClasses('secondary')}>
            Volver al inicio
          </Link>
        </div>
      </Card>
    </Container>
  )
}
