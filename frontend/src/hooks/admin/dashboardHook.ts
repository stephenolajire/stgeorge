import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { dashboardService } from '../../services/admin/dashboardService'
import type { OverviewRange } from '../../types/admin'

export const useDashboardSummary = () => useQuery({ queryKey: ['admin', 'dashboard'], queryFn: dashboardService.getSummary })

export const useVisitorOverview = (range: OverviewRange) =>
  useQuery({
    queryKey: ['admin', 'dashboard', 'visitors', range],
    queryFn: () => dashboardService.getVisitorOverview(range),
    placeholderData: keepPreviousData,
    // Visits are not broadcast as live updates, so refresh now and then.
    refetchInterval: 5 * 60_000,
  })
