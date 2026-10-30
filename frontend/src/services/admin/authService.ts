import api from '../../api/api'
import type { AuthUser, AuthUserApi, LoginCredentials, LoginResponseApi } from '../../types/admin'

function userFromApi(data: AuthUserApi): AuthUser {
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    fullName: data.full_name,
    isStaff: data.is_staff,
  }
}

// The server keeps the session in httpOnly cookies; nothing is stored here.
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { data } = await api.post<LoginResponseApi>('/auth/login/', credentials)
    return userFromApi(data.user)
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUserApi>('/auth/me/')
    return userFromApi(data)
  },

  /** Revokes the session on the server and deletes the cookies. */
  async logout(): Promise<void> {
    await api.post('/auth/logout/')
  },
}
