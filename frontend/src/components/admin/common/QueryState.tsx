import { CircleAlert, LoaderCircle, RotateCw } from 'lucide-react'
import Button from './Button'

export function LoadingCard({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="card flex items-center justify-center gap-3 px-6 py-16 text-muted">
      <LoaderCircle className="size-5 animate-spin text-brand" />
      {label}
    </div>
  )
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <CircleAlert className="size-9 text-danger" />
      <p className="text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RotateCw className="size-4" /> Try again
        </Button>
      )}
    </div>
  )
}
