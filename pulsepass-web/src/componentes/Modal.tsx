import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconoCerrar } from './iconos'

interface PropsModal {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  /** Botones de acción alineados a la derecha (Cancelar / Confirmar…). */
  acciones?: ReactNode
}

/**
 * Modal sobre <dialog> nativo: `showModal()` atrapa el foco (el resto de la página
 * queda inerte), Esc dispara `cancel` y el foco vuelve al disparador al cerrar.
 */
export default function Modal({ abierto, titulo, onCerrar, children, acciones }: PropsModal) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        // Esc: el estado lo controla el padre.
        e.preventDefault()
        onCerrar()
      }}
      onClick={(e) => {
        // Clic en el fondo (fuera de la caja).
        if (e.target === e.currentTarget) onCerrar()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-borde-fuerte bg-superficie-elevada p-0 text-texto shadow-neon backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-borde px-5 py-4">
        <h2 id={idTitulo} className="text-base font-semibold">
          {titulo}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="-m-1 rounded p-1 text-texto-suave hover:text-neon-400"
        >
          <IconoCerrar />
        </button>
      </div>
      <div className="space-y-4 px-5 py-4 text-sm">{children}</div>
      {acciones && <div className="flex justify-end gap-3 px-5 pb-5">{acciones}</div>}
    </dialog>
  )
}
