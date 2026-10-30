import { Church } from 'lucide-react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import LoginBrandPanel from '../../components/admin/auth/LoginBrandPanel'
import LoginForm from '../../components/admin/auth/LoginForm'
import { ADMIN_PATHS } from '../../routes/adminRoute'
import { useCurrentUser } from '../../hooks/admin/authHook'
import { safeNextPath } from '../../utils/authUser'
import { CHURCH } from '../../utils/siteConfig'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNextPath(params.get('next'), ADMIN_PATHS.dashboard)
  const { data: user } = useCurrentUser()

  // Already signed in: go straight to the admin.
  if (user?.isStaff) return <Navigate to={next} replace />

  return (
    <div className="grid min-h-screen bg-page lg:grid-cols-2">
      <LoginBrandPanel church={CHURCH} />

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-11 items-center justify-center rounded-full border-[3px] border-success bg-white text-danger">
              <Church className="size-5" />
            </span>
            <p className="text-sm font-semibold text-ink">{CHURCH.name}</p>
          </div>

          <h1 className="font-display text-3xl font-bold text-ink">Welcome back</h1>
          <p className="mt-2 mb-8 text-[0.9375rem] text-muted">Sign in to manage the parish website.</p>

          <LoginForm onSuccess={() => navigate(next, { replace: true })} />

          <p className="mt-8 text-center text-xs text-muted">Only parish administrators can sign in here.</p>
        </div>
      </div>
    </div>
  )
}
