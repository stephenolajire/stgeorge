import { sacramentsService } from '../admin/sacramentsService'

// Read-only calls for the public Sacraments page. The public only receives published sacraments.
export const publicSacramentsService = {
  getPage: sacramentsService.getPage,
  getSacraments: sacramentsService.list,
}
