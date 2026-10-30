import api from '../../api/api'
import type { Member, MemberApi } from '../../types/admin'
import { aboutService } from '../admin/aboutService'
import { memberFromApi } from '../admin/clergyService'

// Read-only calls for the public About page.
export const publicAboutService = {
  /** Same content the admin edits (/api/about/). */
  getContent: aboutService.get,

  /** Parish priest, bishop and assistant parish priest, in that order. Missing roles are left out. */
  async getLeadership(): Promise<Member[]> {
    const { data } = await api.get<MemberApi[]>('/clergy-staff/leadership/')
    return data.map(memberFromApi)
  },
}
