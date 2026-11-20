import type { ArtistResponse } from '../../features/artists/types'
import type { EventResponse, EventSummaryResponse } from '../../features/events/types'
import type { TicketResponse } from '../../features/tickets/types'
import type { UserResponse } from '../../features/users/types'
import type { VenueResponse } from '../../features/venues/types'

// Reference scenario from PRD §22.
export const venue: VenueResponse = {
  id: 1,
  code: 'VEN-SMR-01',
  name: 'Marina Convention Center',
  city: 'Santa Marta',
  address: 'Cra. 1 #10-20',
  capacity: 3,
  active: true,
}

export const artists: ArtistResponse[] = [
  { id: 1, stageName: 'Solar Beat', country: 'Colombia', genre: 'Electrónica', active: true },
  { id: 2, stageName: 'Neon Waves', country: 'Colombia', genre: 'Synthwave', active: true },
  { id: 3, stageName: 'Caribbean Sound', country: 'Colombia', genre: 'Fusión caribeña', active: true },
]

export const event: EventResponse = {
  id: 1,
  eventCode: 'CMF-2026',
  name: 'Caribbean Music Fest 2026',
  description: 'Tres noches de música caribeña frente a la bahía de Santa Marta.',
  category: 'MUSIC',
  status: 'PUBLISHED',
  eventDate: '2026-12-12T20:00:00',
  minimumAge: 18,
  venueCode: venue.code,
  venueName: venue.name,
  artists: [artists[0]!, artists[1]!],
}

export const publishedEvents: EventSummaryResponse[] = [
  {
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    status: 'PUBLISHED',
    eventDate: '2026-12-12T20:00:00',
    venueName: venue.name,
    category: 'MUSIC',
    venueCity: 'Santa Marta',
  },
  {
    eventCode: 'TECH-2027',
    name: 'Cumbre Tech Caribe 2027',
    status: 'SOLD_OUT',
    eventDate: '2027-01-20T09:00:00',
    venueName: 'Centro de Convenciones Caribe',
    category: 'TECHNOLOGY',
    venueCity: 'Barranquilla',
  },
  {
    eventCode: 'JAZZ-2026',
    name: 'Noche de Jazz y Cultura',
    status: 'PUBLISHED',
    eventDate: '2026-11-27T19:00:00',
    venueName: 'Teatro Heredia Hall',
    category: 'CULTURE',
    venueCity: 'Cartagena',
  },
]

export const ticket: TicketResponse = {
  id: 1,
  ticketCode: 'TKT-8F2A1C',
  type: 'VIP',
  price: 250000,
  status: 'PAID',
  purchaseDate: '2026-11-05T14:32:00',
  userEmail: 'andrea@pulsepass.test',
  eventCode: 'CMF-2026',
  eventName: 'Caribbean Music Fest 2026',
  holderName: 'Andrea Ruiz',
}

// Andrea's tickets (one per status the "Mis tickets" chips filter on).
export const myTickets: TicketResponse[] = [
  ticket,
  {
    ...ticket,
    id: 2,
    ticketCode: 'TKT-5C90E2',
    type: 'GENERAL',
    price: 90000,
    status: 'USED',
    purchaseDate: '2026-10-12T10:00:00',
    eventCode: 'JAZZ-2026',
    eventName: 'Noche de Jazz y Cultura',
  },
  {
    ...ticket,
    id: 3,
    ticketCode: 'TKT-77AD13',
    type: 'STUDENT',
    price: 60000,
    status: 'CANCELLED',
    purchaseDate: '2026-10-01T18:00:00',
    eventCode: 'TECH-2027',
    eventName: 'Cumbre Tech Caribe 2027',
  },
]

// PAID tickets of CMF-2026 (PRD §22.4: Andrea VIP and Carlos GENERAL).
export const paidTickets: TicketResponse[] = [
  ticket,
  {
    ...ticket,
    id: 4,
    ticketCode: 'TKT-91B07D',
    type: 'GENERAL',
    price: 120000,
    purchaseDate: '2026-11-08T09:15:00',
    userEmail: 'carlos@pulsepass.test',
    holderName: 'Carlos Peña',
  },
]

export const currentUser = { id: 1, username: 'andrea', email: 'andrea@pulsepass.test', roles: ['ROLE_USER'] }

export const userProfile: UserResponse = {
  id: 1,
  username: 'andrea',
  email: 'andrea@pulsepass.test',
  firstName: 'Andrea',
  lastName: 'Ruiz',
  active: true,
  birthDate: '2000-05-10',
}
