import { Link } from 'react-router'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Container from '../components/Container'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/Loading'
import PageHeader from '../components/PageHeader'
import { IconArrowRight } from '../components/icons'
import { useAuth, useSignOut } from '../features/auth/hooks'
import type { AuthenticatedUser, Role } from '../features/auth/types'
import { useUserProfile } from '../features/users/hooks'
import { errorMessage } from '../lib/errors'
import { formatDate } from '../lib/format'
import { ROUTES } from '../lib/routes'

const roleLabels: Record<Role, string> = {
  USER: 'Cliente',
  STAFF: 'Staff',
  ADMIN: 'Administrador',
}

const shortcuts: { to: string; label: string; role: Role }[] = [
  { to: ROUTES.myTickets, label: 'Mis tickets', role: 'USER' },
  { to: ROUTES.checkIn, label: 'Validar ingreso', role: 'STAFF' },
  { to: ROUTES.adminEvents, label: 'Administrar eventos', role: 'ADMIN' },
]

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function Profile({ user }: { user: AuthenticatedUser }) {
  const profile = useUserProfile(user.email)

  if (profile.isPending) {
    return (
      <div aria-busy="true" className="space-y-3">
        <span className="sr-only" role="status">
          Cargando perfil…
        </span>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }
  if (profile.isError) {
    return <ErrorState message={errorMessage(profile.error)} onRetry={() => void profile.refetch()} />
  }

  const { firstName, lastName, birthDate, active } = profile.data
  return (
    <dl className="divide-y divide-line text-sm">
      <Row label="Nombre" value={`${firstName} ${lastName}`} />
      <Row label="Fecha de nacimiento" value={birthDate ? formatDate(birthDate) : '—'} />
      <div className="flex justify-between gap-4 py-3">
        <dt className="text-muted">Estado</dt>
        <dd>
          <Badge tone={active ? 'success' : 'muted'}>{active ? 'Activa' : 'Inactiva'}</Badge>
        </dd>
      </div>
    </dl>
  )
}

export default function Account() {
  const { session } = useAuth()
  const signOut = useSignOut()
  if (session.status !== 'authenticated') return null
  const { user } = session

  return (
    <Container width="narrow">
      <PageHeader
        eyebrow="Cuenta"
        title="Mi cuenta"
        actions={
          <Button
            variant="secondary"
            onClick={() => void signOut()}
          >
            Cerrar sesión
          </Button>
        }
      />

      <div className="grid gap-5">
        <Card className="flex flex-wrap items-center gap-5">
          <span className="grid size-16 place-items-center rounded-2xl bg-neon-400 font-display text-2xl font-bold text-ink-950 uppercase shadow-neon-sm">
            {user.username.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-semibold">{user.username}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <Badge key={role} tone={role === 'USER' ? 'neutral' : 'info'}>
                {roleLabels[role]}
              </Badge>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-semibold">Datos personales</h2>
          <Profile user={user} />
        </Card>

        <nav aria-label="Accesos rápidos" className="grid gap-3 sm:grid-cols-3">
          {shortcuts
            .filter((s) => user.roles.includes(s.role))
            .map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 text-sm font-semibold transition hover:border-neon-400 hover:text-neon-300"
              >
                {s.label}
                <IconArrowRight className="size-4" />
              </Link>
            ))}
        </nav>
      </div>
    </Container>
  )
}
