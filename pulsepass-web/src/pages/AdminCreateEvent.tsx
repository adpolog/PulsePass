import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import Alert from '../components/Alert'
import BackLink from '../components/BackLink'
import Button from '../components/Button'
import Card from '../components/Card'
import Container from '../components/Container'
import Field, { FieldWrapper } from '../components/Field'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import { buttonClasses, controlClasses, controlStateClasses, describedBy } from '../components/styles'
import { useAuth } from '../features/auth/hooks'
import { useCreateEvent } from '../features/events/hooks'
import { rememberRecentEvent } from '../features/events/recentEvents'
import { CreateEventRequestSchema, EventCategorySchema, type CreateEventRequest } from '../features/events/types'
import { useActiveVenues } from '../features/venues/hooks'
import { errorMessage } from '../lib/errors'
import { isApiError } from '../lib/http'
import { ROUTES } from '../lib/routes'

const DESCRIPTION_MAX = 1000

const defaultValues: CreateEventRequest = {
  eventCode: '',
  name: '',
  description: '',
  category: 'MUSIC',
  eventDate: '',
  minimumAge: 0,
  venueCode: '',
}

function isFormField(name: string): name is keyof CreateEventRequest {
  return name in defaultValues
}

export default function AdminCreateEvent() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const create = useCreateEvent()
  const venues = useActiveVenues()
  const descriptionId = useId()
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<CreateEventRequest>({
    resolver: zodResolver(CreateEventRequestSchema),
    defaultValues,
  })
  const description = useWatch({ control, name: 'description' })

  const onSubmit = (data: CreateEventRequest) => {
    create.mutate(data, {
      onSuccess: (created) => {
        if (session.status === 'authenticated') rememberRecentEvent(session.user.username, created.eventCode)
        navigate(ROUTES.adminEvent(created.eventCode), { state: { created: true } })
      },
      onError: (error) => {
        if (!isApiError(error)) return
        if (error.status === 403) navigate(ROUTES.forbidden, { replace: true })
        // 400: details map to their field; anything else stays in the general alert.
        if (error.status === 400) {
          for (const [name, message] of Object.entries(error.details)) {
            if (isFormField(name)) setError(name, { message })
          }
        }
      },
    })
  }

  // The general alert shows 409/404/500, and a 400 without per-field details.
  const generalError =
    create.isError &&
    !(isApiError(create.error) && create.error.status === 400 && Object.keys(create.error.details).some(isFormField))

  return (
    <Container width="narrow">
      <BackLink to={ROUTES.adminEvents}>Eventos</BackLink>
      <PageHeader eyebrow="Admin" title="Nuevo evento" />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
          {generalError && <Alert type="error">{errorMessage(create.error)}</Alert>}

          <Field
            label="Código del evento"
            className="font-mono"
            autoComplete="off"
            error={errors.eventCode?.message}
            {...register('eventCode')}
          />
          <Field label="Nombre" autoComplete="off" error={errors.name?.message} {...register('name')} />

          <FieldWrapper id={descriptionId} label="Descripción" error={errors.description?.message}>
            <textarea
              id={descriptionId}
              rows={4}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={describedBy(descriptionId, errors.description?.message)}
              className={clsx(
                controlClasses,
                'py-2.5',
                errors.description ? controlStateClasses.error : controlStateClasses.normal,
              )}
              {...register('description')}
            />
            <p className="mt-1 text-right font-mono text-xs text-muted" aria-live="polite">
              {description.length}/{DESCRIPTION_MAX}
            </p>
          </FieldWrapper>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Categoría" error={errors.category?.message} {...register('category')}>
              {EventCategorySchema.options.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Field
              label="Edad mínima"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              error={errors.minimumAge?.message}
              {...register('minimumAge', { valueAsNumber: true })}
            />
          </div>

          <Field
            label="Fecha y hora"
            type="datetime-local"
            error={errors.eventDate?.message}
            {...register('eventDate')}
          />

          <Select
            label="Sede"
            disabled={venues.isPending}
            error={errors.venueCode?.message ?? (venues.isError ? errorMessage(venues.error) : undefined)}
            hint={venues.isPending ? 'Cargando sedes…' : undefined}
            {...register('venueCode')}
          >
            <option value="">Selecciona una sede</option>
            {venues.data?.map((venue) => (
              <option key={venue.code} value={venue.code}>
                {venue.name} ({venue.code})
              </option>
            ))}
          </Select>

          <div className="flex flex-wrap justify-end gap-3">
            <Link to={ROUTES.adminEvents} className={buttonClasses('secondary')}>
              Cancelar
            </Link>
            <Button type="submit" loading={create.isPending}>
              Crear evento
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  )
}
