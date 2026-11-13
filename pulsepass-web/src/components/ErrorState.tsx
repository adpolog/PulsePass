import Alert from './Alert'
import Button from './Button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-8 text-center">
      <Alert type="error" className="w-full max-w-sm">
        {message}
      </Alert>
      {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
    </div>
  )
}
