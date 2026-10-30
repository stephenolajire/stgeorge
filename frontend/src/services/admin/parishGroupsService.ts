import api from '../../api/api'
import type { ParishGroup, ParishGroupApi, ParishGroupForm } from '../../types/admin'
import { appendImage } from '../formData'

const BASE_URL = '/parish-groups/'

export function groupFromApi(data: ParishGroupApi): ParishGroup {
  return { id: data.id, name: data.name, description: data.description, image: data.image, isActive: data.is_active }
}

function toFormData(values: ParishGroupForm, hadImage: boolean): FormData {
  const form = new FormData()
  form.append('name', values.name)
  form.append('description', values.description)
  form.append('is_active', String(values.isActive))
  appendImage(form, 'image', values.image, hadImage)
  return form
}

export const parishGroupsService = {
  async list(): Promise<ParishGroup[]> {
    const { data } = await api.get<ParishGroupApi[]>(BASE_URL)
    return data.map(groupFromApi)
  },
  create: async (values: ParishGroupForm) => groupFromApi((await api.post<ParishGroupApi>(BASE_URL, toFormData(values, false))).data),
  update: async (group: ParishGroup, values: ParishGroupForm) =>
    groupFromApi((await api.patch<ParishGroupApi>(`${BASE_URL}${group.id}/`, toFormData(values, Boolean(group.image)))).data),
  remove: async (id: number) => void (await api.delete(`${BASE_URL}${id}/`)),
  reorder: async (ids: number[]) => void (await api.post(`${BASE_URL}reorder/`, { ids })),
}
