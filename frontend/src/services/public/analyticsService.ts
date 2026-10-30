import api from '../../api/api'

export const analyticsService = {
  /** Tells the server a public page was viewed (for the dashboard's visitor chart). Errors are ignored. */
  recordVisit: (path: string) => api.post('/analytics/visit/', { path }).catch(() => undefined),
}
