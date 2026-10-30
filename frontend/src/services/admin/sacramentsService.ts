import api from '../../api/api'
import type {
  HighlightApi,
  HighlightForm,
  Sacrament,
  SacramentApi,
  SacramentForm,
  SacramentsPageApi,
  SacramentsPageContent,
} from '../../types/admin'
import { appendImage, toImage } from '../formData'

const PAGE_URL = '/sacraments/page/'
const FEATURES_URL = '/sacraments/features/'

const BASE_URL = '/sacraments/'

export function sacramentFromApi(data: SacramentApi): Sacrament {
  return {
    id: data.id,
    title: data.title,
    icon: data.icon,
    shortDescription: data.short_description,
    content: data.content,
    image: data.image,
    isPublished: data.is_published,
  }
}

function toFormData(values: SacramentForm, hadImage: boolean): FormData {
  const form = new FormData()
  form.append('title', values.title)
  form.append('icon', values.icon)
  form.append('short_description', values.shortDescription)
  form.append('content', values.content)
  form.append('is_published', String(values.isPublished))
  appendImage(form, 'image', values.image, hadImage)
  return form
}

export const sacramentsService = {
  async list(): Promise<Sacrament[]> {
    const { data } = await api.get<SacramentApi[]>(BASE_URL)
    return data.map(sacramentFromApi)
  },
  create: async (values: SacramentForm) =>
    sacramentFromApi((await api.post<SacramentApi>(BASE_URL, toFormData(values, false))).data),
  update: async (sacrament: Sacrament, values: SacramentForm) =>
    sacramentFromApi(
      (await api.patch<SacramentApi>(`${BASE_URL}${sacrament.id}/`, toFormData(values, Boolean(sacrament.image)))).data,
    ),
  setPublished: async (id: number, isPublished: boolean) =>
    sacramentFromApi((await api.patch<SacramentApi>(`${BASE_URL}${id}/`, { is_published: isPublished })).data),
  remove: async (id: number) => void (await api.delete(`${BASE_URL}${id}/`)),
  reorder: async (ids: number[]) => void (await api.post(`${BASE_URL}reorder/`, { ids })),

  async getPage(): Promise<SacramentsPageContent> {
    const { data } = await api.get<SacramentsPageApi>(PAGE_URL)
    return pageFromApi(data)
  },

  /** Saves the page text and hero image. Feature cards are saved on their own. */
  async updatePage(content: Omit<SacramentsPageContent, 'features'>): Promise<SacramentsPageContent> {
    const form = new FormData()
    form.append('hero_title', content.hero.title)
    form.append('hero_subtitle', content.hero.subtitle)
    form.append('intro_title', content.intro.title)
    form.append('intro_text', content.intro.text)
    form.append('quote_text', content.quote.text)
    form.append('quote_source', content.quote.source)
    form.append('list_title', content.list.title)
    form.append('list_subtitle', content.list.subtitle)
    form.append('cta_title', content.cta.title)
    form.append('cta_text', content.cta.text)
    appendImage(form, 'hero_image', content.hero.image)
    const { data } = await api.patch<SacramentsPageApi>(PAGE_URL, form)
    return pageFromApi(data)
  },

  features: {
    create: async (values: HighlightForm) => featureFromApi((await api.post<HighlightApi>(FEATURES_URL, values)).data),
    update: async (id: number, values: HighlightForm) =>
      featureFromApi((await api.patch<HighlightApi>(`${FEATURES_URL}${id}/`, values)).data),
    remove: async (id: number) => void (await api.delete(`${FEATURES_URL}${id}/`)),
    reorder: async (ids: number[]) => void (await api.post(`${FEATURES_URL}reorder/`, { ids })),
  },
}

const featureFromApi = ({ id, title, text, icon }: HighlightApi) => ({ id, title, text, icon })

function pageFromApi(data: SacramentsPageApi): SacramentsPageContent {
  return {
    hero: { title: data.hero_title, subtitle: data.hero_subtitle, image: toImage(data.hero_image) },
    intro: { title: data.intro_title, text: data.intro_text },
    quote: { text: data.quote_text, source: data.quote_source },
    list: { title: data.list_title, subtitle: data.list_subtitle },
    cta: { title: data.cta_title, text: data.cta_text },
    features: data.features.map(featureFromApi),
  }
}
