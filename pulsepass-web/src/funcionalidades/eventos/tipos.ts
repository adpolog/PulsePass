import { z } from 'zod'
import { FechaHoraLocalSchema, listaSegura } from '../../lib/esquemas'
import { ArtistResponseSchema } from '../artistas/tipos'


export const EventCategorySchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])
export type EventCategory = z.infer<typeof EventCategorySchema>

export const EventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'])
export type EventStatus = z.infer<typeof EventStatusSchema>

export const EventResponseSchema = z.object({
  id: z.number().int(),
  eventCode: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: FechaHoraLocalSchema,
  minimumAge: z.number().int().nullable(),
  venueCode: z.string().nullable(),
  venueName: z.string().nullable(),
  artists: listaSegura(ArtistResponseSchema),
})
export type EventResponse = z.infer<typeof EventResponseSchema>


export const EventSummaryResponseSchema = z.object({
  eventCode: z.string(),
  name: z.string(),
  status: EventStatusSchema,
  eventDate: FechaHoraLocalSchema,
  venueName: z.string().nullable(),
  category: EventCategorySchema,
  venueCity: z.string().nullable(),
})
export type EventSummaryResponse = z.infer<typeof EventSummaryResponseSchema>

export const ListaEventosResumenSchema = z.array(EventSummaryResponseSchema)


export const CreateEventRequestSchema = z.object({
  eventCode: z
    .string()
    .trim()
    .min(1, 'Ingresa el código del evento')
    .max(50, 'Máximo 50 caracteres'),
  name: z.string().trim().min(1, 'Ingresa el nombre').max(150, 'Máximo 150 caracteres'),
  description: z.string().max(1000, 'Máximo 1000 caracteres'),
  category: EventCategorySchema,
  eventDate: z.iso.datetime({ local: true, error: 'Ingresa la fecha y hora' }),
  minimumAge: z
    .number({ error: 'Ingresa la edad mínima' })
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativa'),
  venueCode: z.string().min(1, 'Selecciona una sede'),
})
export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>
