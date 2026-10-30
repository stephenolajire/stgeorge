import type { MediaImage } from './about'

export type MemberCategory = 'clergy' | 'religious' | 'staff'

/** Which tab is open on the Clergy & Staff page. */
export type MemberTab = 'all' | MemberCategory | 'inactive'

export type MemberStatusFilter = '' | 'active' | 'inactive'

export interface Member {
  id: number
  fullName: string
  role: string
  roleLabel: string
  category: MemberCategory
  shortBio: string
  /** Plain text */
  description: string
  phone: string
  email: string
  photo: string | null
  isActive: boolean
  order: number
}

/** What the edit panel works with. */
export interface MemberFormValues {
  fullName: string
  role: string
  shortBio: string
  description: string
  phone: string
  email: string
  isActive: boolean
  photo: MediaImage | null
}

export interface RoleOption {
  value: string
  label: string
  category: MemberCategory
}

export interface MemberCounts {
  all: number
  clergy: number
  religious: number
  staff: number
  inactive: number
}

export interface ClergySummary {
  counts: MemberCounts
  roles: RoleOption[]
}

export interface MemberListParams {
  category?: MemberCategory
  role?: string
  status?: MemberStatusFilter
  search?: string
  page: number
}

export interface Paginated<T> {
  count: number
  results: T[]
}

/** Member as sent by the Django API (/api/clergy-staff/). */
export interface MemberApi {
  id: number
  full_name: string
  role: string
  role_label: string
  category: MemberCategory
  short_bio: string
  description: string
  phone: string
  email: string
  photo: string | null
  is_active: boolean
  order: number
}
