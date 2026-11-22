import apiClient from '@/lib/axios-instance'
import { ApiResponse, LoginResponse } from '@/types'

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      { email, password },
    )
    return response.data.data
  },
}
