import { LoaderCircle } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page text-brand">
      <LoaderCircle className="size-8 animate-spin" aria-label="Loading" />
    </div>
  )
}
