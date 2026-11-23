import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconClose } from './icons'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
}

// Native <dialog>: showModal() traps focus and Esc fires "cancel".
export default function Modal({ open, title, onClose, children, actions }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line-strong bg-surface-raised p-0 text-foreground shadow-neon backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <h2 id={titleId} className="text-base font-semibold">
          {title}
        </h2>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="-m-1 rounded p-1 text-muted hover:text-neon-400">
          <IconClose />
        </button>
      </div>
      <div className="space-y-4 px-5 py-4 text-sm">{children}</div>
      {actions && <div className="flex justify-end gap-3 px-5 pb-5">{actions}</div>}
    </dialog>
  )
}
