import { apiClient } from '@/lib/axios'
import { DashboardSummary } from '@/types'

export const dashboardApi = () => {
  const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<{ data: DashboardSummary }>(
      '/dashboard/summary',
    )
    return response.data.data
  }

  return {
    getDashboardSummary,
  }
}
