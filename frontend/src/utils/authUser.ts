import type { AuthUser } from '../types/admin'

/** Name to show for a user: their full name, or the part of their email before the @. */
export function displayName(user: AuthUser): string {
  return user.fullName.trim() || user.email.split('@')[0]
}

export function firstName(user: AuthUser): string {
  return user.firstName.trim() || displayName(user).split(' ')[0]
}

/** Only staff may use the admin. Keeps "next" redirects inside the admin. */
export function safeNextPath(next: string | null, fallback: string): string {
  return next && next.startsWith('/admin') && !next.startsWith('//') ? next : fallback
}
