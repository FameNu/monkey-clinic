import apiClient from '@/lib/axios-instance'
import { ApiResponse, DashboardSummary } from '@/types'

export const dashboardApi = () => {
  const getDashboardSummary = async (
    date: string,
  ): Promise<DashboardSummary> => {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      '/dashboard/summary',
      { params: { date } },
    )
    return response.data.data
  }

  return {
    getDashboardSummary,
  }
}
