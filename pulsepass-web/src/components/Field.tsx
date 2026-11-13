import { clsx } from 'clsx'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { IconAlert } from './icons'
import { controlClasses, controlStateClasses, describedBy } from './styles'

interface FieldWrapperProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FieldWrapper({ id, label, error, hint, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <IconAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

interface FieldProps extends ComponentProps<'input'> {
  label: string
  error?: string
  hint?: string
}

export default function Field({ label, error, hint, id, className, ...props }: FieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldWrapper id={fieldId} label={label} error={error} hint={hint}>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={clsx(controlClasses, error ? controlStateClasses.error : controlStateClasses.normal, className)}
        {...props}
      />
    </FieldWrapper>
  )
}
