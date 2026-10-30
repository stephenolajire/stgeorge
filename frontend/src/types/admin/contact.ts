import type { MediaImage } from './about'

export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived'
/** Tabs on the admin page; "all" is everything except archived. */
export type MessageTab = 'all' | 'unread' | 'replied' | 'archived'
export type MessageDateFilter = '' | 'today' | '7days' | '30days' | 'year'

export interface ContactReply {
  id: number
  subject: string
  body: string
  sentByName: string
  sentAt: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  subjectLabel: string
  message: string
  status: MessageStatus
  createdAt: string
  repliedAt: string | null
  replies: ContactReply[]
}

export interface MessageListParams {
  tab: MessageTab
  search?: string
  date?: MessageDateFilter
  page: number
}

export type MessageCounts = Record<'all' | 'unread' | 'read' | 'replied' | 'archived', number>

export interface SubjectOption {
  value: string
  label: string
}

/** What the public contact form sends. */
export interface ContactFormValues {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  /** Hidden spam trap; must stay empty. */
  website: string
}

export interface FAQ {
  id: number
  question: string
  answer: string
}

export interface ContactPageContent {
  hero: { title: string; subtitle: string; image: MediaImage | null }
  details: {
    address: string
    phone: string
    phoneHours: string
    email: string
    emailNote: string
    officeDays: string
    officeHours: string
  }
  form: { title: string; subtitle: string }
  map: { title: string; subtitle: string; query: string; directions: string }
  faq: { title: string; subtitle: string }
  banner: { title: string; quote: string; quoteSource: string; image: MediaImage | null }
  /** Picture in the site footer, with a caption. */
  footer: { caption: string; image: MediaImage | null }
  faqs: FAQ[]
}

// --- Shapes sent by the Django API ---

export interface ContactMessageApi {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  subject_label: string
  message: string
  status: MessageStatus
  created_at: string
  replied_at: string | null
  replies: { id: number; subject: string; body: string; sent_by_name: string; sent_at: string }[]
}

export interface ContactPageApi {
  hero_title: string
  hero_subtitle: string
  hero_image: string | null
  address: string
  phone: string
  phone_hours: string
  email: string
  email_note: string
  office_days: string
  office_hours: string
  form_title: string
  form_subtitle: string
  map_title: string
  map_subtitle: string
  map_query: string
  directions: string
  faq_title: string
  faq_subtitle: string
  banner_title: string
  banner_quote: string
  banner_quote_source: string
  banner_image: string | null
  footer_caption: string
  footer_image: string | null
  faqs: FAQ[]
}
