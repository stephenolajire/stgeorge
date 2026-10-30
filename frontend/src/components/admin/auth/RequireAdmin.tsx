import { isAxiosError } from 'axios'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser, useLogout } from '../../../hooks/admin/authHook'
import { ADMIN_PATHS } from '../../../routes/adminRoute'
import type { AuthUser } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import Button from '../common/Button'
import PageLoader from '../common/PageLoader'
import { ErrorCard } from '../common/QueryState'

/** Renders its children only for a signed-in staff user; otherwise sends them to the login page. */
export default function RequireAdmin({ children }: { children: (user: AuthUser) => ReactNode }) {
  const location = useLocation()
  const { data: user, isPending, isError, error, refetch } = useCurrentUser()
  const { mutate: logout } = useLogout()

  const loginUrl = `${ADMIN_PATHS.login}?next=${encodeURIComponent(location.pathname + location.search)}`
  const signOut = () => logout(undefined, { onSettled: () => window.location.assign(ADMIN_PATHS.login) })

  if (isPending) return <PageLoader />

  if (isError) {
    // Not signed in, or the session has expired.
    if (isAxiosError(error) && error.response?.status === 401) return <Navigate to={loginUrl} replace />
    return (
      <div className="flex min-h-screen items-center justify-center bg-page p-6">
        <div className="w-full max-w-md space-y-3">
          <ErrorCard message={getErrorMessage(error, 'Could not load your account.')} onRetry={() => refetch()} />
          <Button variant="secondary" onClick={signOut} className="w-full">
            Sign out
          </Button>
        </div>
      </div>
    )
  }

  if (!user.isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page p-6">
        <div className="card max-w-md space-y-4 p-8 text-center">
          <p className="text-ink">Your account ({user.email}) does not have access to the admin.</p>
          <Button onClick={signOut}>Sign in with another account</Button>
        </div>
      </div>
    )
  }

  return children(user)
}
