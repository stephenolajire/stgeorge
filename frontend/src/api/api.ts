import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

/** Where to send the user when their session has ended. Matches ADMIN_PATHS.login. */
const LOGIN_PATH = '/admin/login'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** Set once a request has been retried after refreshing the session. */
    _retried?: boolean
  }
}

/**
 * Shared axios instance for every call to the Django API.
 *
 * The login tokens live in httpOnly cookies set by the server, so this code never
 * sees them: `withCredentials` makes the browser send them. The X-Requested-With
 * header is required by the server on requests that change data (CSRF protection).
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  timeout: 30_000,
})

// One refresh at a time: requests that fail together share the same refresh call.
let refreshing: Promise<void> | null = null

function refreshSession(): Promise<void> {
  refreshing ??= api
    .post('/auth/refresh/')
    .then(() => undefined)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/** The session is over: send admin users to the login page, then back to where they were. */
function endSession() {
  const { pathname, search } = window.location
  if (pathname.startsWith('/admin') && !pathname.startsWith(LOGIN_PATH)) {
    window.location.assign(`${LOGIN_PATH}?next=${encodeURIComponent(pathname + search)}`)
  }
}

const NO_REFRESH_URLS = ['/auth/login/', '/auth/refresh/', '/auth/logout/']

// When the access cookie has expired, refresh the session and retry the request once.
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as InternalAxiosRequestConfig | undefined

  if (error.response?.status !== 401 || !config || config._retried || NO_REFRESH_URLS.includes(config.url ?? '')) {
    return Promise.reject(error)
  }

  try {
    await refreshSession()
  } catch {
    endSession()
    return Promise.reject(error)
  }
  config._retried = true
  return api(config)
})

export default api
