import type { ComponentProps } from 'react'
import { IconSpinner } from './icons'
import { buttonClasses, type ButtonVariant } from './styles'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, className)}
      {...props}
    >
      {loading ? (
        <>
          <IconSpinner className="size-4 animate-spin" />
          Cargando…
        </>
      ) : (
        children
      )}
    </button>
  )
}
