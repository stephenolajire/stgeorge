import api from '../../api/api'
import type {
  Activity,
  ActivityApi,
  ActivityForm,
  Highlight,
  HighlightApi,
  HighlightForm,
  ParishLifeContent,
  ParishLifePageApi,
} from '../../types/admin'
import { appendImage, toImage } from '../formData'

const PAGE_URL = '/parish-life/'
const HIGHLIGHTS_URL = '/parish-life/highlights/'
const ACTIVITIES_URL = '/parish-life/activities/'

const highlightFromApi = ({ id, title, text, icon }: HighlightApi): Highlight => ({ id, title, text, icon })

export function activityFromApi(data: ActivityApi): Activity {
  return {
    id: data.id,
    title: data.title,
    shortDescription: data.short_description,
    content: data.content,
    image: data.image,
    isPublished: data.is_published,
  }
}

function pageFromApi(data: ParishLifePageApi): ParishLifeContent {
  return {
    hero: { title: data.hero_title, subtitle: data.hero_subtitle, image: toImage(data.hero_image) },
    intro: { title: data.intro_title, text: data.intro_text, image: toImage(data.intro_image) },
    highlights: data.highlights.map(highlightFromApi),
    activities: data.activities.map(activityFromApi),
  }
}

function activityFormData(values: ActivityForm, hadImage: boolean): FormData {
  const form = new FormData()
  form.append('title', values.title)
  form.append('short_description', values.shortDescription)
  form.append('content', values.content)
  form.append('is_published', String(values.isPublished))
  appendImage(form, 'image', values.image, hadImage)
  return form
}

export const parishLifeService = {
  async getPage(): Promise<ParishLifeContent> {
    const { data } = await api.get<ParishLifePageApi>(PAGE_URL)
    return pageFromApi(data)
  },

  /** Saves the banner and introduction. Cards are saved on their own. */
  async updatePage({ hero, intro }: Pick<ParishLifeContent, 'hero' | 'intro'>): Promise<ParishLifeContent> {
    const form = new FormData()
    form.append('hero_title', hero.title)
    form.append('hero_subtitle', hero.subtitle)
    form.append('intro_title', intro.title)
    form.append('intro_text', intro.text)
    appendImage(form, 'hero_image', hero.image)
    appendImage(form, 'intro_image', intro.image)
    const { data } = await api.patch<ParishLifePageApi>(PAGE_URL, form)
    return pageFromApi(data)
  },

  highlights: {
    create: async (values: HighlightForm) => highlightFromApi((await api.post<HighlightApi>(HIGHLIGHTS_URL, values)).data),
    update: async (id: number, values: HighlightForm) =>
      highlightFromApi((await api.patch<HighlightApi>(`${HIGHLIGHTS_URL}${id}/`, values)).data),
    remove: async (id: number) => void (await api.delete(`${HIGHLIGHTS_URL}${id}/`)),
    reorder: async (ids: number[]) => void (await api.post(`${HIGHLIGHTS_URL}reorder/`, { ids })),
  },

  activities: {
    create: async (values: ActivityForm) =>
      activityFromApi((await api.post<ActivityApi>(ACTIVITIES_URL, activityFormData(values, false))).data),
    update: async (activity: Activity, values: ActivityForm) =>
      activityFromApi(
        (await api.patch<ActivityApi>(`${ACTIVITIES_URL}${activity.id}/`, activityFormData(values, Boolean(activity.image)))).data,
      ),
    remove: async (id: number) => void (await api.delete(`${ACTIVITIES_URL}${id}/`)),
    reorder: async (ids: number[]) => void (await api.post(`${ACTIVITIES_URL}reorder/`, { ids })),
  },
}
