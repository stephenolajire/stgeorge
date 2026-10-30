import { isAxiosError } from 'axios'

/** Turns an API error into a message that can be shown to the user. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!isAxiosError(error)) return fallback
  if (!error.response) return 'Cannot reach the server. Check your connection and try again.'

  const { status, data } = error.response
  if (status === 401 || status === 403) return 'You do not have permission to do this. Please sign in as an administrator.'

  if (data && typeof data === 'object') {
    if ('detail' in data && typeof data.detail === 'string') return data.detail
    // DRF field errors: { field_name: ["message", ...] }
    const first = Object.entries(data)[0]
    if (first) {
      const [field, messages] = first
      const message = Array.isArray(messages) ? messages[0] : messages
      if (typeof message === 'string') return `${field.replaceAll('_', ' ')}: ${message}`
    }
  }
  return fallback
}
