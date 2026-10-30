import { newsEventsService } from '../admin/newsEventsService'

// Read-only calls for the public News & Events page. The public only receives published items.
export const publicNewsEventsService = {
  getPage: newsEventsService.getPage,
  listEvents: newsEventsService.listEvents,
  listNews: newsEventsService.listNews,
}
