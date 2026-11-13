import type { ComponentProps } from 'react'

/**
 * Íconos SVG de trazo (DES-01). Decorativos por defecto (`aria-hidden`);
 * el texto accesible lo aporta el elemento que los contiene.
 * Se añadirán más íconos a medida que las páginas los necesiten.
 */
type PropsIcono = ComponentProps<'svg'>

function Svg({ className = 'size-5', children, ...props }: PropsIcono) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconoAlerta(props: PropsIcono) {
  return (
    <Svg {...props}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </Svg>
  )
}

export function IconoCheck(props: PropsIcono) {
  return (
    <Svg {...props}>
      <path d="m5 12 5 5L20 7" />
    </Svg>
  )
}

export function IconoInfo(props: PropsIcono) {
  return (
    <Svg {...props}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </Svg>
  )
}

export function IconoCerrar(props: PropsIcono) {
  return (
    <Svg {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  )
}

export function IconoBandeja(props: PropsIcono) {
  return (
    <Svg {...props}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z" />
    </Svg>
  )
}

export function IconoGiro(props: PropsIcono) {
  return (
    <Svg {...props}>
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </Svg>
  )
}
