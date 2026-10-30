import type { MediaImage } from './about'

export interface ParishGroup {
  id: number
  name: string
  description: string
  image: string | null
  isActive: boolean
}

export interface ParishGroupForm {
  name: string
  description: string
  image: MediaImage | null
  isActive: boolean
}

/** Group as sent by the Django API (/api/parish-groups/). */
export interface ParishGroupApi {
  id: number
  name: string
  description: string
  image: string | null
  is_active: boolean
  order: number
}
