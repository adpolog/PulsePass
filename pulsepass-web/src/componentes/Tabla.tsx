import type { ReactNode } from 'react'

export interface ColumnaTabla<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
}

interface PropsTabla<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  claveFila: (fila: T) => string
  /** Descripción accesible de la tabla. */
  titulo: string
}

/**
 * Tabla genérica (PRD §9.1, guía React §10).
 * En escritorio (md+) es una <table>; en móvil cada fila se muestra como tarjeta
 * con pares encabezado/valor (PRD §9.15).
 */
export default function Tabla<T>({ columnas, filas, claveFila, titulo }: PropsTabla<T>) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-borde bg-superficie md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{titulo}</caption>
          <thead className="border-b border-borde text-xs text-texto-suave">
            <tr>
              {columnas.map((c) => (
                <th key={c.encabezado} scope="col" className="px-4 py-3 font-semibold">
                  {c.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {filas.map((fila) => (
              <tr key={claveFila(fila)} className="hover:bg-tinta-850">
                {columnas.map((c) => (
                  <td key={c.encabezado} className="px-4 py-3 align-middle">
                    {c.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={titulo} className="space-y-3 md:hidden">
        {filas.map((fila) => (
          <li key={claveFila(fila)} className="rounded-xl border border-borde bg-superficie p-4">
            <dl className="space-y-2 text-sm">
              {columnas.map((c) => (
                <div key={c.encabezado} className="flex items-center justify-between gap-4">
                  <dt className="text-texto-suave">{c.encabezado}</dt>
                  <dd className="text-right">{c.celda(fila)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
