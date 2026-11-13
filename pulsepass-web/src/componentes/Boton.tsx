import type { ComponentProps } from 'react'
import { clasesBoton, type VarianteBoton } from './estilos'
import { IconoGiro } from './iconos'

interface PropsBoton extends ComponentProps<'button'> {
  variante?: VarianteBoton
  /** Deshabilita el botón y muestra "Cargando…" para evitar dobles envíos. */
  cargando?: boolean
}

export default function Boton({
  variante = 'primario',
  cargando = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: PropsBoton) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={clasesBoton(variante, className)}
      {...props}
    >
      {cargando ? (
        <>
          <IconoGiro className="size-4 animate-spin" />
          Cargando…
        </>
      ) : (
        children
      )}
    </button>
  )
}
