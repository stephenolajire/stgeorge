import api from '../../api/api'
import type {
  Highlight,
  HighlightApi,
  HighlightForm,
  HomeContent,
  HomePageApi,
  HomeSections,
  Paginated,
  QuickLink,
  QuickLinkApi,
  QuickLinkForm,
  Subscriber,
  SubscriberApi,
} from '../../types/admin'
import { appendImage, toImage } from '../formData'

const PAGE_URL = '/home/'
const HIGHLIGHTS_URL = '/home/highlights/'
const LINKS_URL = '/home/links/'
const SUBSCRIBERS_URL = '/subscribers/'

const highlightFromApi = ({ id, title, text, icon }: HighlightApi): Highlight => ({ id, title, text, icon })
const linkFromApi = (d: QuickLinkApi): QuickLink => ({
  id: d.id,
  title: d.title,
  text: d.text,
  image: d.image,
  linkLabel: d.link_label,
  target: d.target,
})

function pageFromApi(d: HomePageApi): HomeContent {
  return {
    hero: { title: d.hero_title, tagline: d.hero_tagline, text: d.hero_text, quote: d.hero_quote, image: toImage(d.hero_image) },
    about: { title: d.about_title, text: d.about_text, image: toImage(d.about_image) },
    news: { title: d.news_title, subtitle: d.news_subtitle },
    newsletter: { title: d.newsletter_title, text: d.newsletter_text, image: toImage(d.newsletter_image) },
    highlights: d.highlights.map(highlightFromApi),
    links: d.links.map(linkFromApi),
  }
}

function linkFormData(v: QuickLinkForm, hadImage: boolean) {
  const form = new FormData()
  form.append('title', v.title)
  form.append('text', v.text)
  form.append('link_label', v.linkLabel)
  form.append('target', v.target)
  appendImage(form, 'image', v.image, hadImage)
  return form
}

export const homeService = {
  getPage: async () => pageFromApi((await api.get<HomePageApi>(PAGE_URL)).data),

  /** Saves the text and images. Cards are saved on their own. */
  async updatePage({ hero, about, news, newsletter }: HomeSections): Promise<HomeContent> {
    const form = new FormData()
    form.append('hero_title', hero.title)
    form.append('hero_tagline', hero.tagline)
    form.append('hero_text', hero.text)
    form.append('hero_quote', hero.quote)
    form.append('about_title', about.title)
    form.append('about_text', about.text)
    form.append('news_title', news.title)
    form.append('news_subtitle', news.subtitle)
    form.append('newsletter_title', newsletter.title)
    form.append('newsletter_text', newsletter.text)
    appendImage(form, 'hero_image', hero.image)
    appendImage(form, 'about_image', about.image)
    appendImage(form, 'newsletter_image', newsletter.image)
    return pageFromApi((await api.patch<HomePageApi>(PAGE_URL, form)).data)
  },

  highlights: {
    create: async (values: HighlightForm) => highlightFromApi((await api.post<HighlightApi>(HIGHLIGHTS_URL, values)).data),
    update: async (id: number, values: HighlightForm) => highlightFromApi((await api.patch<HighlightApi>(`${HIGHLIGHTS_URL}${id}/`, values)).data),
    remove: async (id: number) => void (await api.delete(`${HIGHLIGHTS_URL}${id}/`)),
    reorder: async (ids: number[]) => void (await api.post(`${HIGHLIGHTS_URL}reorder/`, { ids })),
  },

  links: {
    create: async (values: QuickLinkForm) => linkFromApi((await api.post<QuickLinkApi>(LINKS_URL, linkFormData(values, false))).data),
    update: async (link: QuickLink, values: QuickLinkForm) =>
      linkFromApi((await api.patch<QuickLinkApi>(`${LINKS_URL}${link.id}/`, linkFormData(values, Boolean(link.image)))).data),
    remove: async (id: number) => void (await api.delete(`${LINKS_URL}${id}/`)),
    reorder: async (ids: number[]) => void (await api.post(`${LINKS_URL}reorder/`, { ids })),
  },

  // Newsletter sign-ups
  subscribe: async (email: string, website = '') => void (await api.post(`${SUBSCRIBERS_URL}subscribe/`, { email, website })),
  async listSubscribers(params: { search: string; page: number }): Promise<Paginated<Subscriber>> {
    const { data } = await api.get<Paginated<SubscriberApi>>(SUBSCRIBERS_URL, { params: { search: params.search || undefined, page: params.page } })
    return { count: data.count, results: data.results.map((s) => ({ id: s.id, email: s.email, createdAt: s.created_at })) }
  },
  removeSubscriber: async (id: number) => void (await api.delete(`${SUBSCRIBERS_URL}${id}/`)),
  async exportSubscribers(search: string) {
    const response = await api.get<Blob>(`${SUBSCRIBERS_URL}export/`, { params: { search: search || undefined }, responseType: 'blob' })
    const name = /filename="([^"]+)"/.exec(response.headers['content-disposition'] ?? '')?.[1] ?? 'subscribers.csv'
    const url = URL.createObjectURL(response.data)
    const link = Object.assign(document.createElement('a'), { href: url, download: name })
    link.click()
    URL.revokeObjectURL(url)
  },
}
