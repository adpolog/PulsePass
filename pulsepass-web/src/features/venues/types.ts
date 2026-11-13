import { z } from 'zod'

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

export const VenueListSchema = z.array(VenueResponseSchema)
