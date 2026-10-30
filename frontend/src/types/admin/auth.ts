export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  isStaff: boolean
}

/** User as returned by the Django API. */
export interface AuthUserApi {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_staff: boolean
}

/** The tokens are set as httpOnly cookies, so only the user comes back in the body. */
export interface LoginResponseApi {
  user: AuthUserApi
}
