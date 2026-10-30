import type { OverviewRange } from '../types/admin'

export const RANGE_OPTIONS: { value: OverviewRange; label: string; days: number }[] = [
  { value: '7d', label: 'Last 7 Days', days: 7 },
  { value: '30d', label: 'Last 30 Days', days: 30 },
  { value: '90d', label: 'Last 90 Days', days: 90 },
]
