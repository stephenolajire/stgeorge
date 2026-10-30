import api from '../../api/api'
import type { EventApi, EventItem } from '../../types/admin'
import { homeService } from '../admin/homeService'
import { eventFromApi, newsEventsService } from '../admin/newsEventsService'

// Read-only calls for the public Home page, plus the newsletter sign-up.
export const publicHomeService = {
  getPage: homeService.getPage,
  /** The event to feature: the soonest featured upcoming event, else the soonest upcoming one. */
  async nextEvent(): Promise<EventItem | null> {
    const { data } = await api.get<EventApi | null>('/events/next/')
    return data ? eventFromApi(data) : null
  },
  latestNews: async () => (await newsEventsService.listNews({ page: 1, pageSize: 3 })).results,
  subscribe: homeService.subscribe,
}
