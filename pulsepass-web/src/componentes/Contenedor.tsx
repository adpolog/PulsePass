import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type Ancho = 'normal' | 'estrecho'

const anchos: Record<Ancho, string> = {
  normal: 'max-w-6xl',
  estrecho: 'max-w-3xl',
}

interface PropsContenedor {
  ancho?: Ancho
  className?: string
  children: ReactNode
}

export default function Contenedor({ ancho = 'normal', className, children }: PropsContenedor) {
  return <div className={clsx('mx-auto w-full px-4 py-8', anchos[ancho], className)}>{children}</div>
}
