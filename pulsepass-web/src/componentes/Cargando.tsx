import { clsx } from 'clsx'

/** Bloque esqueleto para componer la forma del contenido que se está cargando. */
export function Esqueleto({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx('animate-pulse rounded-md bg-tinta-800', className)} />
}

interface PropsCargando {
  /** Texto para lectores de pantalla. */
  mensaje?: string
  /** Cantidad de tarjetas esqueleto. */
  cantidad?: number
  className?: string
}

/**
 * Estado "cargando" por defecto (PRD §9.20): rejilla de tarjetas esqueleto con aria-busy.
 * Las páginas con otra forma pueden componer su propio esqueleto con <Esqueleto />.
 */
export default function Cargando({ mensaje = 'Cargando…', cantidad = 3, className }: PropsCargando) {
  return (
    <div
      aria-busy="true"
      className={clsx('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}
    >
      <span className="sr-only" role="status">
        {mensaje}
      </span>
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="rounded-xl border border-borde bg-superficie p-4">
          <Esqueleto className="h-32 w-full rounded-lg" />
          <Esqueleto className="mt-4 h-3 w-1/3" />
          <Esqueleto className="mt-3 h-4 w-3/4" />
          <Esqueleto className="mt-3 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
