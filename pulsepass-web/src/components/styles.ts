import { clsx } from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold ' +
  'transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ' +
  'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-ink-800 ' +
  'disabled:text-disabled disabled:shadow-none'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-neon',
  secondary: 'border border-line-strong text-foreground hover:border-neon-400 hover:text-neon-300',
  danger: 'border border-red-500/60 text-red-300 hover:bg-red-600 hover:text-white',
  ghost: 'text-neon-400 hover:bg-neon-950',
}

// Also used by <Link> elements that look like buttons.
export function buttonClasses(variant: ButtonVariant = 'primary', className?: string): string {
  return clsx(buttonBase, buttonVariants[variant], className)
}

export const controlClasses =
  'block min-h-11 w-full rounded-xl border bg-field px-3.5 text-sm text-foreground ' +
  'placeholder:text-disabled transition ' +
  'focus-visible:border-neon-400 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export const controlStateClasses = {
  normal: 'border-line hover:border-line-strong',
  error: 'border-red-500',
} as const

export function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}
