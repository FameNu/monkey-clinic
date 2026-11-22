import apiClient from '@/lib/axios-instance'
import { ApiResponse, DashboardSummary } from '@/types'

export const dashboardApi = () => {
  const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      '/dashboard/summary',
    )
    return response.data.data
  }

  return {
    getDashboardSummary,
  }
}
