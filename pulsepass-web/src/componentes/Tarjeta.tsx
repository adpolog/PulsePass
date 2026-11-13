import { clsx } from 'clsx'
import type { ComponentProps } from 'react'

/** Superficie visual: negro elevado con borde gris oscuro. */
export default function Tarjeta({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={clsx('rounded-xl border border-borde bg-superficie p-5 sm:p-6', className)}
      {...props}
    />
  )
}
