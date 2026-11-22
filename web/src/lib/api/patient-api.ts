import apiClient from '@/lib/axios-instance'
import {
  Patient,
  PatientAllergy,
  CreatePatientPayload,
  AddPatientAllergyPayload,
} from '@/types'

export const patientApi = () => {
  const getPatients = async (search?: string): Promise<Patient[]> => {
    const params = new URLSearchParams()
    if (search?.trim()) {
      params.append('search', search.trim())
    }
    const query = params.toString()
    const url = query ? `/patients?${query}` : '/patients'

    const response = await apiClient.get<{ data: Patient[] }>(url)
    return response.data.data || []
  }

  const getPatientById = async (id: string): Promise<Patient> => {
    const response = await apiClient.get<{ data: Patient }>(`/patients/${id}`)
    return response.data.data
  }

  const createPatient = async (
    payload: CreatePatientPayload,
  ): Promise<Patient> => {
    const response = await apiClient.post<{ data: Patient }>(
      '/patients',
      payload,
    )
    return response.data.data
  }

  const addPatientAllergy = async (
    patientId: string,
    payload: AddPatientAllergyPayload,
  ): Promise<PatientAllergy> => {
    const response = await apiClient.post<{ data: PatientAllergy }>(
      `/patients/${patientId}/allergies`,
      payload,
    )
    return response.data.data
  }

  return {
    getPatients,
    getPatientById,
    createPatient,
    addPatientAllergy,
  }
}
