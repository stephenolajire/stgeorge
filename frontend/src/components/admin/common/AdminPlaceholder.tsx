import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ADMIN_PATHS } from '../../../routes/adminRoute'

export default function AdminPlaceholder() {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Construction className="size-10 text-warning" />
      <h1 className="card-title text-xl">This page is not built yet</h1>
      <p className="text-subtle">It will be available here once it is ready.</p>
      <Link to={ADMIN_PATHS.dashboard} className="link-action mt-2">
        Back to dashboard
      </Link>
    </div>
  )
}
