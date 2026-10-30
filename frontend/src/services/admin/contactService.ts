import api from '../../api/api'
import type {
  ContactFormValues,
  ContactMessage,
  ContactMessageApi,
  ContactPageApi,
  ContactPageContent,
  FAQ,
  MessageCounts,
  MessageListParams,
  MessageStatus,
  Paginated,
  SubjectOption,
} from '../../types/admin'
import { appendImage, toImage } from '../formData'

const MESSAGES_URL = '/contact/messages/'
const PAGE_URL = '/contact/page/'
const FAQS_URL = '/contact/faqs/'

export function messageFromApi(data: ContactMessageApi): ContactMessage {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    subjectLabel: data.subject_label,
    message: data.message,
    status: data.status,
    createdAt: data.created_at,
    repliedAt: data.replied_at,
    replies: data.replies.map((r) => ({ id: r.id, subject: r.subject, body: r.body, sentByName: r.sent_by_name, sentAt: r.sent_at })),
  }
}

function pageFromApi(d: ContactPageApi): ContactPageContent {
  return {
    hero: { title: d.hero_title, subtitle: d.hero_subtitle, image: toImage(d.hero_image) },
    details: {
      address: d.address,
      phone: d.phone,
      phoneHours: d.phone_hours,
      email: d.email,
      emailNote: d.email_note,
      officeDays: d.office_days,
      officeHours: d.office_hours,
    },
    form: { title: d.form_title, subtitle: d.form_subtitle },
    map: { title: d.map_title, subtitle: d.map_subtitle, query: d.map_query, directions: d.directions },
    faq: { title: d.faq_title, subtitle: d.faq_subtitle },
    banner: { title: d.banner_title, quote: d.banner_quote, quoteSource: d.banner_quote_source, image: toImage(d.banner_image) },
    faqs: d.faqs,
  }
}

const listParams = ({ tab, search, date, page }: Partial<MessageListParams>) => ({
  status: tab && tab !== 'all' ? tab : undefined,
  search: search || undefined,
  date: date || undefined,
  page,
})

export const contactService = {
  // Public
  send: async (values: ContactFormValues) => void (await api.post(MESSAGES_URL, values)),
  subjects: async () => (await api.get<SubjectOption[]>(`${MESSAGES_URL}subjects/`)).data,
  getPage: async () => pageFromApi((await api.get<ContactPageApi>(PAGE_URL)).data),

  // Admin: messages
  async list(params: MessageListParams): Promise<Paginated<ContactMessage>> {
    const { data } = await api.get<Paginated<ContactMessageApi>>(MESSAGES_URL, { params: listParams(params) })
    return { count: data.count, results: data.results.map(messageFromApi) }
  },
  summary: async () => (await api.get<MessageCounts>(`${MESSAGES_URL}summary/`)).data,
  setStatus: async (id: number, status: Exclude<MessageStatus, 'replied'>) =>
    messageFromApi((await api.patch<ContactMessageApi>(`${MESSAGES_URL}${id}/`, { status })).data),
  reply: async (id: number, subject: string, body: string) =>
    messageFromApi((await api.post<ContactMessageApi>(`${MESSAGES_URL}${id}/reply/`, { subject, body })).data),
  remove: async (id: number) => void (await api.delete(`${MESSAGES_URL}${id}/`)),
  bulkDelete: async (ids: number[]) => (await api.post<{ deleted: number }>(`${MESSAGES_URL}bulk-delete/`, { ids })).data,
  markAllRead: async () => (await api.post<{ updated: number }>(`${MESSAGES_URL}mark-all-read/`)).data,

  /** Downloads the messages matching the filter as a CSV file. */
  async exportCsv(params: Omit<MessageListParams, 'page'>) {
    const response = await api.get<Blob>(`${MESSAGES_URL}export/`, { params: listParams(params), responseType: 'blob' })
    const name = /filename="([^"]+)"/.exec(response.headers['content-disposition'] ?? '')?.[1] ?? 'contact-messages.csv'
    const url = URL.createObjectURL(response.data)
    const link = Object.assign(document.createElement('a'), { href: url, download: name })
    link.click()
    URL.revokeObjectURL(url)
  },

  // Admin: page content
  async updatePage(c: Omit<ContactPageContent, 'faqs'>): Promise<ContactPageContent> {
    const form = new FormData()
    const fields: Record<string, string> = {
      hero_title: c.hero.title,
      hero_subtitle: c.hero.subtitle,
      address: c.details.address,
      phone: c.details.phone,
      phone_hours: c.details.phoneHours,
      email: c.details.email,
      email_note: c.details.emailNote,
      office_days: c.details.officeDays,
      office_hours: c.details.officeHours,
      form_title: c.form.title,
      form_subtitle: c.form.subtitle,
      map_title: c.map.title,
      map_subtitle: c.map.subtitle,
      map_query: c.map.query,
      directions: c.map.directions,
      faq_title: c.faq.title,
      faq_subtitle: c.faq.subtitle,
      banner_title: c.banner.title,
      banner_quote: c.banner.quote,
      banner_quote_source: c.banner.quoteSource,
    }
    Object.entries(fields).forEach(([k, v]) => form.append(k, v))
    appendImage(form, 'hero_image', c.hero.image)
    appendImage(form, 'banner_image', c.banner.image)
    return pageFromApi((await api.patch<ContactPageApi>(PAGE_URL, form)).data)
  },

  faqs: {
    create: async (v: Omit<FAQ, 'id'>) => (await api.post<FAQ>(FAQS_URL, v)).data,
    update: async (id: number, v: Omit<FAQ, 'id'>) => (await api.patch<FAQ>(`${FAQS_URL}${id}/`, v)).data,
    remove: async (id: number) => void (await api.delete(`${FAQS_URL}${id}/`)),
    reorder: async (ids: number[]) => void (await api.post(`${FAQS_URL}reorder/`, { ids })),
  },
}
