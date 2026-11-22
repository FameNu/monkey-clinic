import apiClient from '@/lib/axios-instance'
import {
  Doctor,
  Patient,
  Appointment,
  MedicalRecord,
  CreateMedicalRecordPayload,
} from '@/types'

export const clinicApi = () => {
  const getPatients = async (): Promise<Patient[]> => {
    const response = await apiClient.get<{ data: Patient[] }>('/patients')
    return response.data.data || []
  }

  const getActiveDoctors = async (): Promise<Doctor[]> => {
    const response = await apiClient.get<{ data: Doctor[] }>('/doctors')
    return (response.data.data || []).filter((d) => d.is_active)
  }

  const createMedicalRecord = async (
    payload: CreateMedicalRecordPayload,
  ): Promise<MedicalRecord> => {
    const response = await apiClient.post<{ data: MedicalRecord }>(
      '/medical-records',
      payload,
    )
    return response.data.data
  }

  const getPatientHistory = async (
    patientId: string,
  ): Promise<Appointment[]> => {
    const response = await apiClient.get<{ data: Appointment[] }>(
      `/patients/${patientId}/medical-history`,
    )
    return response.data.data || []
  }

  return {
    getPatients,
    getActiveDoctors,
    createMedicalRecord,
    getPatientHistory,
  }
}
