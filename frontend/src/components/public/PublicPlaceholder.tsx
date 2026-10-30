import { Church } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../routes/publicRoute'

export default function PublicPlaceholder() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      <Church className="size-12 text-gold" />
      <h1 className="mt-4 font-display text-3xl font-bold text-primary">Coming soon</h1>
      <p className="mt-3 text-muted">This page is being prepared. Please check back soon.</p>
      <Link to={PUBLIC_PATHS.about} className="mt-6 text-sm font-semibold text-brand hover:underline">
        Read about our parish
      </Link>
    </div>
  )
}
