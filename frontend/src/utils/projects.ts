import type { ProjectOrdering, ProjectStatus, StatusOption, Tone } from '../types/admin'

/** Badge colour, progress-bar colour and tab dot for each status. Keys match the server's ProjectStatus. */
export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone; bar: string; dot: string }> = {
  ongoing: { label: 'Ongoing', tone: 'success', bar: 'bg-success', dot: 'bg-success' },
  completed: { label: 'Completed', tone: 'info', bar: 'bg-info', dot: 'bg-info' },
  upcoming: { label: 'Upcoming', tone: 'warning', bar: 'bg-accent', dot: 'bg-warning' },
}

export const PROJECT_STATUSES = Object.keys(PROJECT_STATUS) as ProjectStatus[]

export const PROJECT_STATUS_OPTIONS: StatusOption[] = PROJECT_STATUSES.map((value) => ({ value, label: PROJECT_STATUS[value].label, tone: PROJECT_STATUS[value].tone }))

export const PROJECT_ORDERING_OPTIONS: { value: ProjectOrdering; label: string }[] = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'progress', label: 'Most Progress' },
  { value: 'title', label: 'Title (A–Z)' },
]

/** 25000000 -> "₦25,000,000" */
export const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`
