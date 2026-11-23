import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import Loading from './components/Loading'
import GuestOnlyRoute from './layouts/GuestOnlyRoute'
import Layout from './layouts/Layout'
import ProtectedRoute from './layouts/ProtectedRoute'
import RoleRoute from './layouts/RoleRoute'
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home'

// Lazy loading: each page is downloaded only when visited (FE-012).
function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    errorElement: <ErrorPage />,
    HydrateFallback: () => <Loading />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, Component: Home },
          { path: 'events', lazy: page(() => import('./pages/EventCatalog')) },
          { path: 'events/:eventCode', lazy: page(() => import('./pages/EventDetail')) },
          { path: 'artists', lazy: page(() => import('./pages/ArtistList')) },
          { path: 'artists/:id', lazy: page(() => import('./pages/ArtistDetail')) },
          { path: 'venues', lazy: page(() => import('./pages/VenueList')) },
          { path: 'venues/:code', lazy: page(() => import('./pages/VenueDetail')) },
          {
            Component: GuestOnlyRoute,
            children: [
              { path: 'login', lazy: page(() => import('./pages/Login')) },
              { path: 'register', lazy: page(() => import('./pages/Register')) },
            ],
          },
          {
            Component: ProtectedRoute,
            children: [
              { path: 'account', lazy: page(() => import('./pages/Account')) },
              {
                element: <RoleRoute roles={['USER']} />,
                children: [
                  { path: 'my-tickets', lazy: page(() => import('./pages/MyTickets')) },
                  { path: 'my-tickets/:ticketCode', lazy: page(() => import('./pages/TicketDetail')) },
                  {
                    path: 'purchase/confirmation/:ticketCode',
                    lazy: page(() => import('./pages/PurchaseConfirmation')),
                  },
                ],
              },
              {
                element: <RoleRoute roles={['STAFF', 'ADMIN']} />,
                children: [
                  { path: 'staff/check-in', lazy: page(() => import('./pages/CheckIn')) },
                  // Optional eventCode: /staff/events/tickets shows the event search.
                  { path: 'staff/events/:eventCode?/tickets', lazy: page(() => import('./pages/PaidTickets')) },
                ],
              },
              {
                element: <RoleRoute roles={['ADMIN']} />,
                children: [
                  { path: 'admin/events', lazy: page(() => import('./pages/AdminEvents')) },
                  { path: 'admin/events/new', lazy: page(() => import('./pages/AdminCreateEvent')) },
                  { path: 'admin/events/:eventCode', lazy: page(() => import('./pages/AdminManageEvent')) },
                ],
              },
            ],
          },
          { path: '403', lazy: page(() => import('./pages/Forbidden')) },
          { path: '*', lazy: page(() => import('./pages/NotFound')) },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
