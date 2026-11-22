import apiClient from '@/lib/axios-instance'
import {
  CreateMedicationRequest,
  MedicationCreatedResponse,
  MedicationListResponse,
  Medication,
  UpdateMedicationRequest,
  UpdateMedicationStockRequest,
} from '@/types'

export const medicationApi = () => {
  const getMedications = async (): Promise<Medication[]> => {
    const response = await apiClient.get<MedicationListResponse>('/medications')
    return response.data.medications ?? []
  }

  const createMedication = async (
    payload: CreateMedicationRequest,
  ): Promise<Medication> => {
    const response = await apiClient.post<MedicationCreatedResponse>(
      '/medications',
      payload,
    )
    return response.data.medication
  }

  const updateMedication = async (
    id: string,
    payload: UpdateMedicationRequest,
  ): Promise<Medication> => {
    const response = await apiClient.put<MedicationCreatedResponse>(
      `/medications/${id}`,
      payload,
    )
    return response.data.medication
  }

  const restockMedication = async (
    id: string,
    payload: UpdateMedicationStockRequest,
  ): Promise<void> => {
    await apiClient.patch(`/medications/${id}/restock`, payload)
  }

  return {
    getMedications,
    createMedication,
    updateMedication,
    restockMedication,
  }
}
