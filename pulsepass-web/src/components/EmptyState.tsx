import type { ReactNode } from 'react'
import { IconInbox } from './icons'

interface EmptyStateProps {
  message: string
  action?: ReactNode
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
      <IconInbox className="size-8 text-neon-400" />
      <p className="font-semibold">{message}</p>
      {action}
    </div>
  )
}
