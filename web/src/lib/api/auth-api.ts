import { apiClient } from '@/lib/axios'
import { User } from '@/types'

export interface LoginResponse {
  token: string
  user: User
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<{ data: LoginResponse }>(
      '/auth/login',
      { email, password },
    )
    return response.data.data
  },
}
