import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Field from '../components/Field'
import AuthShell from '../features/auth/components/AuthShell'
import { useAuth } from '../features/auth/hooks'
import { LoginRequestSchema, type LoginRequest } from '../features/auth/types'
import { errorMessage } from '../lib/errors'
import { isApiError } from '../lib/http'
import { ROUTES, readRedirect } from '../lib/routes'

const RegisteredStateSchema = z.object({ registered: z.string() })

function loginError(error: unknown): string {
  if (isApiError(error) && error.status === 401) return 'Usuario o contraseña incorrectos.'
  return errorMessage(error)
}

export default function Login() {
  const { session, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const registered = RegisteredStateSchema.safeParse(location.state).data?.registered

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { identifier: registered ?? '', password: '' },
  })

  const onSubmit = async (data: LoginRequest) => {
    setError(null)
    try {
      await login(data.identifier, data.password)
      navigate(readRedirect(location.state), { replace: true })
    } catch (e: unknown) {
      setError(loginError(e))
    }
  }

  const expired = session.status === 'anonymous' && session.reason === 'expired'

  return (
    <AuthShell
      eyebrow="Acceso"
      title="Inicia sesión"
      subtitle="Usa tu nombre de usuario o tu correo."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to={ROUTES.register} state={location.state} className="font-semibold text-neon-400 hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {registered && <Alert type="success">Cuenta creada. Ya puedes iniciar sesión.</Alert>}
        {expired && !error && <Alert type="warning">Tu sesión expiró. Inicia sesión de nuevo.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Field
          label="Usuario o correo"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Entrar
        </Button>
      </form>
    </AuthShell>
  )
}
