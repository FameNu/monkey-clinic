import apiClient from '@/lib/axios-instance'
import { ApiResponse, CreateDoctorRequest, Doctor } from '@/types'

export const doctorApi = () => ({
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/doctors')
    return response.data.data ?? []
  },
  createDoctor: async (payload: CreateDoctorRequest): Promise<Doctor> => {
    const response = await apiClient.post<ApiResponse<Doctor>>('/doctors', payload)
    return response.data.data
  },
})
