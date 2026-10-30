import { isAxiosError } from 'axios'
import { CircleAlert, LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useLogin } from '../../../hooks/admin/authHook'
import { authService } from '../../../services/admin/authService'
import type { AuthUser } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import Button from '../common/Button'
import FormField from '../common/FormField'
import PasswordField from './PasswordField'

function loginErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) return 'Incorrect email or password.'
    if (error.response?.status === 429) return 'Too many sign-in attempts. Please wait a minute and try again.'
  }
  return getErrorMessage(error, 'Could not sign in. Please try again.')
}

export default function LoginForm({ onSuccess }: { onSuccess: (user: AuthUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { mutate: login, isPending } = useLogin()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    login(
      { email: email.trim(), password },
      {
        onSuccess: async (user) => {
          if (!user.isStaff) {
            await authService.logout().catch(() => undefined)
            setError('This account does not have access to the admin.')
            return
          }
          onSuccess(user)
        },
        onError: (err) => setError(loginErrorMessage(err)),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <FormField
        label="Email address"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="username"
        autoFocus
        required
        placeholder="you@example.com"
        inputClassName="h-11 text-sm"
      />
      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        required
      />

      <Button type="submit" disabled={isPending || !email.trim() || !password} className="h-11 w-full">
        <LogIn className="size-4" /> {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
