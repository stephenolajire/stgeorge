import { parishGroupsService } from '../admin/parishGroupsService'
import { parishLifeService } from '../admin/parishLifeService'

// Read-only calls for the public Parish Life page. The public only receives published / active items.
export const publicParishLifeService = {
  getPage: parishLifeService.getPage,
  getGroups: parishGroupsService.list,
}
