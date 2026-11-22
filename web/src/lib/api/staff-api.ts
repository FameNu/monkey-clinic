import apiClient from '@/lib/axios-instance'
import { ApiResponse, StaffPayload, StaffRecord, StaffFilters } from '@/types'

export const staffApi = () => ({
  getStaff: async (filters: StaffFilters = {}): Promise<StaffRecord[]> => {
    const response = await apiClient.get<ApiResponse<StaffRecord[]>>('/staff', {
      params: {
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
        ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
      },
    })
    return response.data.data ?? []
  },
  createStaff: async (payload: StaffPayload): Promise<StaffRecord> => {
    const response = await apiClient.post<ApiResponse<StaffRecord>>(
      '/staff',
      payload,
    )
    return response.data.data
  },
  updateStaff: async (
    id: string,
    payload: StaffPayload,
  ): Promise<StaffRecord> => {
    const response = await apiClient.put<ApiResponse<StaffRecord>>(
      `/staff/${id}`,
      payload,
    )
    return response.data.data
  },
})
