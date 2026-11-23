import type { ReactNode } from 'react'

export interface TableColumn<T> {
  header: string
  cell: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  title: string
}

// Table on md+; on mobile each row becomes a card (PRD §9.15).
export default function Table<T>({ columns, rows, rowKey, title }: TableProps<T>) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="border-b border-line font-mono text-[11px] tracking-wider text-muted uppercase">
            <tr>
              {columns.map((c) => (
                <th key={c.header} scope="col" className="px-4 py-3 font-semibold">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-surface-raised">
                {columns.map((c) => (
                  <td key={c.header} className="px-4 py-3 align-middle">
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={title} className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-2xl border border-line bg-surface p-4">
            <dl className="space-y-2 text-sm">
              {columns.map((c) => (
                <div key={c.header} className="flex items-center justify-between gap-4">
                  <dt className="text-muted">{c.header}</dt>
                  <dd className="text-right">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
