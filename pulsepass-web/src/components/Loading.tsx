import { clsx } from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx('animate-pulse rounded-md bg-ink-800', className)} />
}

interface LoadingProps {
  message?: string
  count?: number
  className?: string
}

export default function Loading({ message = 'Cargando…', count = 3, className }: LoadingProps) {
  return (
    <div aria-busy="true" className={clsx('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      <span className="sr-only" role="status">
        {message}
      </span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-14 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <Skeleton className="mt-5 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
