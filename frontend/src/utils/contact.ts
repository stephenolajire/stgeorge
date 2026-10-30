import type { MessageDateFilter, MessageStatus, Tone } from '../types/admin'

export const MESSAGE_STATUS: Record<MessageStatus, { label: string; tone: Tone }> = {
  unread: { label: 'Unread', tone: 'danger' },
  read: { label: 'Read', tone: 'info' },
  replied: { label: 'Replied', tone: 'success' },
  archived: { label: 'Archived', tone: 'neutral' },
}

export const MESSAGE_DATE_OPTIONS: { value: Exclude<MessageDateFilter, ''>; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'year', label: 'Last 12 Months' },
]

/** Map embed for a search such as "St. George Catholic Church, Ofatedo" (no API key needed). */
export const mapEmbedUrl = (query: string) => `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
export const mapLinkUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
