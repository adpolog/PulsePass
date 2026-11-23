import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type BadgeTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info' | 'muted'

const tones: Record<BadgeTone, string> = {
  success: 'border-neon-700 text-neon-300',
  neutral: 'border-ink-600 text-white',
  warning: 'border-amber-700 text-amber-300',
  danger: 'border-red-800 text-red-300',
  info: 'border-sky-800 text-sky-300',
  muted: 'border-ink-700 text-ink-400',
}

const dots: Record<BadgeTone, string> = {
  success: 'bg-neon-400 shadow-neon-sm',
  neutral: 'bg-white',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-sky-400',
  muted: 'bg-ink-500',
}

interface BadgeProps {
  tone: BadgeTone
  children: ReactNode
  className?: string
}

export default function Badge({ tone, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md border bg-ink-950/60 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase',
        tones[tone],
        className,
      )}
    >
      <span aria-hidden="true" className={clsx('size-1.5 rounded-full', dots[tone])} />
      {children}
    </span>
  )
}
