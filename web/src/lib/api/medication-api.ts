import apiClient from '@/lib/axios-instance'
import { Medication } from '@/types'

export const medicationApi = () => {
  const getMedications = async (): Promise<Medication[]> => {
    const response = await apiClient.get<{ data: Medication[] }>('/medications')
    return response.data.data || []
  }

  return {
    getMedications,
  }
}
