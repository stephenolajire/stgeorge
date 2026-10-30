import api from '../../api/api'
import type {
  ClergySummary,
  Member,
  MemberApi,
  MemberFormValues,
  MemberListParams,
  Paginated,
} from '../../types/admin'

const BASE_URL = '/clergy-staff/'

/** Members shown per page; matches the server's page size. */
export const MEMBERS_PAGE_SIZE = 10

export function memberFromApi(data: MemberApi): Member {
  return {
    id: data.id,
    fullName: data.full_name,
    role: data.role,
    roleLabel: data.role_label,
    category: data.category,
    shortBio: data.short_bio,
    description: data.description,
    phone: data.phone,
    email: data.email,
    photo: data.photo,
    isActive: data.is_active,
    order: data.order,
  }
}

/** Builds the upload form. A removed photo is sent as remove_photo, an unchanged one is left out. */
function toFormData(values: MemberFormValues, hadPhoto: boolean): FormData {
  const form = new FormData()
  form.append('full_name', values.fullName)
  form.append('role', values.role)
  form.append('short_bio', values.shortBio)
  form.append('description', values.description)
  form.append('phone', values.phone)
  form.append('email', values.email)
  form.append('is_active', String(values.isActive))
  if (values.photo?.file) form.append('photo', values.photo.file)
  else if (!values.photo && hadPhoto) form.append('remove_photo', 'true')
  return form
}

export const clergyService = {
  async list({ category, role, status, search, page }: MemberListParams): Promise<Paginated<Member>> {
    const { data } = await api.get<Paginated<MemberApi>>(BASE_URL, {
      params: { category, role: role || undefined, status: status || undefined, search: search || undefined, page },
    })
    return { count: data.count, results: data.results.map(memberFromApi) }
  },

  async summary(): Promise<ClergySummary> {
    const { data } = await api.get<ClergySummary>(`${BASE_URL}summary/`)
    return data
  },

  async create(values: MemberFormValues): Promise<Member> {
    const { data } = await api.post<MemberApi>(BASE_URL, toFormData(values, false))
    return memberFromApi(data)
  },

  async update(member: Member, values: MemberFormValues): Promise<Member> {
    const { data } = await api.patch<MemberApi>(`${BASE_URL}${member.id}/`, toFormData(values, Boolean(member.photo)))
    return memberFromApi(data)
  },

  async setActive(id: number, isActive: boolean): Promise<Member> {
    const { data } = await api.patch<MemberApi>(`${BASE_URL}${id}/`, { is_active: isActive })
    return memberFromApi(data)
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${BASE_URL}${id}/`)
  },

  /** Saves a new display order for these members. */
  async reorder(ids: number[]): Promise<void> {
    await api.post(`${BASE_URL}reorder/`, { ids })
  },
}
