import api from '../../api/api'
import type { AboutPageApi, AboutPageContent, MediaImage } from '../../types/admin'

const ABOUT_URL = '/about/'

const toImage = (url: string | null): MediaImage | null => (url ? { url } : null)

function fromApi(data: AboutPageApi): AboutPageContent {
  return {
    hero: { title: data.hero_title, subtitle: data.hero_subtitle, image: toImage(data.hero_image) },
    mainContent: { description: data.description, image: toImage(data.main_image) },
    mission: data.mission,
    vision: data.vision,
    coreValues: data.core_values,
    patron: data.patron,
    history: { title: data.history_title, text: data.history, image: toImage(data.history_image) },
    parishInfo: {
      established: data.established,
      diocese: data.diocese,
      parishPriest: data.parish_priest,
      location: data.location,
    },
  }
}

/**
 * Images: a newly picked file is uploaded, a removed image is sent as remove_<field>,
 * and an unchanged image is left out so the server keeps it.
 */
function appendImage(
  form: FormData,
  field: 'hero_image' | 'main_image' | 'history_image',
  image: MediaImage | null,
) {
  if (image?.file) form.append(field, image.file)
  else if (!image) form.append(`remove_${field}`, 'true')
}

function toFormData(content: AboutPageContent): FormData {
  const form = new FormData()
  form.append('hero_title', content.hero.title)
  form.append('hero_subtitle', content.hero.subtitle)
  form.append('description', content.mainContent.description)
  form.append('mission', content.mission)
  form.append('vision', content.vision)
  form.append('core_values', content.coreValues)
  form.append('patron', content.patron)
  form.append('history_title', content.history.title)
  form.append('history', content.history.text)
  form.append('established', content.parishInfo.established)
  form.append('diocese', content.parishInfo.diocese)
  form.append('parish_priest', content.parishInfo.parishPriest)
  form.append('location', content.parishInfo.location)
  appendImage(form, 'hero_image', content.hero.image)
  appendImage(form, 'main_image', content.mainContent.image)
  appendImage(form, 'history_image', content.history.image)
  return form
}

export const aboutService = {
  async get(): Promise<AboutPageContent> {
    const { data } = await api.get<AboutPageApi>(ABOUT_URL)
    return fromApi(data)
  },

  async update(content: AboutPageContent): Promise<AboutPageContent> {
    const { data } = await api.patch<AboutPageApi>(ABOUT_URL, toFormData(content))
    return fromApi(data)
  },
}
