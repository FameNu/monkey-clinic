import { apiClient } from '@/lib/axios'
import { Doctor, Patient } from '@/types'

export const clinicApi = () => {
  const getPatients = async (): Promise<Patient[]> => {
    const response = await apiClient.get<{ data: Patient[] }>('/patients')
    return response.data.data || []
  }

  const getActiveDoctors = async (): Promise<Doctor[]> => {
    const response = await apiClient.get<{ data: Doctor[] }>('/doctors')
    return (response.data.data || []).filter((d) => d.is_active)
  }

  return {
    getPatients,
    getActiveDoctors,
  }
}
