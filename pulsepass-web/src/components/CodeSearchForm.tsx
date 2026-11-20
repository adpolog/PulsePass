import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from './Button'
import Field from './Field'
import { IconSearch } from './icons'

interface CodeSearchFormProps {
  label: string
  submitLabel: string
  emptyMessage: string
  defaultValue?: string
  autoFocus?: boolean
  onSearch: (code: string) => void
}

// Search by code (ticket or event). To clear it, the parent changes its `key`, which also
// re-focuses the field when autoFocus is on (useful at the door, PRD §9.14).
export default function CodeSearchForm({
  label,
  submitLabel,
  emptyMessage,
  defaultValue = '',
  autoFocus = false,
  onSearch,
}: CodeSearchFormProps) {
  const [schema] = useState(() => z.object({ code: z.string().trim().min(1, emptyMessage) }))
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { code: defaultValue },
  })

  return (
    <form
      role="search"
      noValidate
      onSubmit={handleSubmit(({ code }) => onSearch(code))}
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <Field
          label={label}
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          className="font-mono"
          error={errors.code?.message}
          {...register('code')}
        />
      </div>
      <Button type="submit" className="sm:mt-6">
        <IconSearch className="size-4" />
        {submitLabel}
      </Button>
    </form>
  )
}
