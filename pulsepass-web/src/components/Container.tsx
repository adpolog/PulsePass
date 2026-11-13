import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type Width = 'default' | 'narrow'

const widths: Record<Width, string> = {
  default: 'max-w-6xl',
  narrow: 'max-w-3xl',
}

interface ContainerProps {
  width?: Width
  className?: string
  children: ReactNode
}

export default function Container({ width = 'default', className, children }: ContainerProps) {
  return <div className={clsx('mx-auto w-full px-4 py-10', widths[width], className)}>{children}</div>
}
