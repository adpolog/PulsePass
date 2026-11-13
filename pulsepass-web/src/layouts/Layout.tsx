import { Outlet } from 'react-router'
import Footer from './Footer'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only rounded-lg bg-primario px-4 py-2 font-semibold text-sobre-primario focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
