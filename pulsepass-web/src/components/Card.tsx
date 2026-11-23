import { clsx } from 'clsx'
import type { ComponentProps } from 'react'

export default function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx('rounded-2xl border border-line bg-surface p-5 sm:p-6', className)} {...props} />
}
