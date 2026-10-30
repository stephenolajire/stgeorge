import type { StatusOption } from '../types/admin'

export const PUBLISH_STATUS_OPTIONS: StatusOption[] = [
  { value: 'published', label: 'Published', tone: 'success' },
  { value: 'draft', label: 'Draft', tone: 'neutral' },
]
