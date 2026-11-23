import { clsx } from 'clsx'
import { useId, type ComponentProps } from 'react'
import { FieldWrapper } from './Field'
import { controlClasses, controlStateClasses, describedBy } from './styles'

interface SelectProps extends ComponentProps<'select'> {
  label: string
  error?: string
  hint?: string
}

export default function Select({ label, error, hint, id, className, children, ...props }: SelectProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldWrapper id={fieldId} label={label} error={error} hint={hint}>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={clsx(
          controlClasses,
          'pr-8',
          error ? controlStateClasses.error : controlStateClasses.normal,
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
}
