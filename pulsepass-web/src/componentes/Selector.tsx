import { clsx } from 'clsx'
import { useId, type ComponentProps } from 'react'
import { EnvoltorioCampo } from './Campo'
import { clasesControl, clasesControlEstado, idsDescripcion } from './estilos'

interface PropsSelector extends ComponentProps<'select'> {
  etiqueta: string
  error?: string
  ayuda?: string
}

/** Igual que Campo, para <select>. Las opciones se pasan como children. */
export default function Selector({
  etiqueta,
  error,
  ayuda,
  id,
  className,
  children,
  ...props
}: PropsSelector) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado

  return (
    <EnvoltorioCampo id={idCampo} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <select
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={idsDescripcion(idCampo, error, ayuda)}
        className={clsx(
          clasesControl,
          'pr-8',
          error ? clasesControlEstado.error : clasesControlEstado.normal,
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </EnvoltorioCampo>
  )
}
