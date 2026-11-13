import { clsx } from 'clsx'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { clasesControl, clasesControlEstado, idsDescripcion } from './estilos'
import { IconoAlerta } from './iconos'

interface PropsEnvoltorio {
  id: string
  etiqueta: string
  error?: string
  ayuda?: string
  children: ReactNode
}

/** Etiqueta + control + ayuda/error con los ids accesibles ya enlazados. */
export function EnvoltorioCampo({ id, etiqueta, error, ayuda, children }: PropsEnvoltorio) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-texto">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <IconoAlerta className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="mt-1.5 text-xs text-texto-suave">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}

interface PropsCampo extends ComponentProps<'input'> {
  etiqueta: string
  error?: string
  ayuda?: string
}

/** Campo de texto con label asociado, aria-invalid y aria-describedby (PRD §9.1). */
export default function Campo({ etiqueta, error, ayuda, id, className, ...props }: PropsCampo) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado

  return (
    <EnvoltorioCampo id={idCampo} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <input
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={idsDescripcion(idCampo, error, ayuda)}
        className={clsx(
          clasesControl,
          error ? clasesControlEstado.error : clasesControlEstado.normal,
          className,
        )}
        {...props}
      />
    </EnvoltorioCampo>
  )
}
