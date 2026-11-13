import { z } from 'zod'

/** VenueResponse (backend: dto/response/VenueResponse.java). */
export const VenueResponseSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string().nullable(),
  capacity: z.number().int(),
  active: z.boolean(),
})
export type VenueResponse = z.infer<typeof VenueResponseSchema>

export const ListaSedesSchema = z.array(VenueResponseSchema)
