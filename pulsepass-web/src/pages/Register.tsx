import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Field from '../components/Field'
import AuthShell from '../features/auth/components/AuthShell'
import { useRegisterUser } from '../features/users/hooks'
import { RegisterUserRequestSchema, type RegisterUserRequest } from '../features/users/types'
import { errorMessage } from '../lib/errors'
import { isApiError } from '../lib/http'
import { ROUTES, readRedirect } from '../lib/routes'

const defaultValues: RegisterUserRequest = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  password: '',
}

function isFormField(name: string): name is keyof RegisterUserRequest {
  return name in defaultValues
}

export default function Register() {
  const location = useLocation()
  const navigate = useNavigate()
  const registerUser = useRegisterUser()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterUserRequest>({
    resolver: zodResolver(RegisterUserRequestSchema),
    defaultValues,
  })

  const onSubmit = (data: RegisterUserRequest) => {
    registerUser.mutate(data, {
      onSuccess: () =>
        navigate(ROUTES.login, { state: { registered: data.username, from: readRedirect(location.state) } }),
      onError: (error) => {
        // 400 details come per field from the backend.
        if (isApiError(error) && error.status === 400) {
          for (const [name, message] of Object.entries(error.details)) {
            if (isFormField(name)) setError(name, { message })
          }
        }
      },
    })
  }

  return (
    <AuthShell
      eyebrow="Registro"
      title="Crea tu cuenta"
      subtitle="Necesitas una cuenta para comprar entradas."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to={ROUTES.login} state={location.state} className="font-semibold text-neon-400 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {registerUser.isError && <Alert type="error">{errorMessage(registerUser.error)}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombres" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
          <Field label="Apellidos" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Field label="Usuario" autoComplete="username" error={errors.username?.message} {...register('username')} />
        <Field label="Correo" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Field
          label="Fecha de nacimiento"
          type="date"
          autoComplete="bday"
          error={errors.birthDate?.message}
          {...register('birthDate')}
        />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 12 caracteres."
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={registerUser.isPending} className="w-full">
          Crear cuenta
        </Button>
      </form>
    </AuthShell>
  )
}
