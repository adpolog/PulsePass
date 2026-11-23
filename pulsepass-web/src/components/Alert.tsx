import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { IconAlert, IconBolt, IconCheck, IconClose } from './icons'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

const styles: Record<AlertType, string> = {
  success: 'border-neon-800 bg-neon-950/70 text-neon-200',
  error: 'border-red-900 bg-red-950/60 text-red-200',
  warning: 'border-amber-800 bg-amber-950/60 text-amber-200',
  info: 'border-line-strong bg-surface-raised text-ink-300',
}

const icons: Record<AlertType, typeof IconAlert> = {
  success: IconCheck,
  error: IconAlert,
  warning: IconAlert,
  info: IconBolt,
}

interface AlertProps {
  type: AlertType
  children: ReactNode
  onClose?: () => void
  className?: string
}

// Errors use role="alert" (announced right away); the rest use role="status".
export default function Alert({ type, children, onClose, className }: AlertProps) {
  const Icon = icons[type]
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={clsx('flex items-start gap-2.5 rounded-xl border p-3 text-sm', styles[type], className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="-m-1 rounded p-1 opacity-70 hover:opacity-100">
          <IconClose className="size-4" />
        </button>
      )}
    </div>
  )
}
