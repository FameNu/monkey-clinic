import apiClient from '@/lib/axios-instance'
import {
  Appointment,
  AppointmentStatus,
  AppointmentFilters,
  CreateAppointmentRequest,
} from '@/types'

export const appointmentApi = () => {
  const getAppointments = async (
    filters?: AppointmentFilters,
  ): Promise<Appointment[]> => {
    const params = new URLSearchParams()
    if (filters?.date) params.append('date', filters.date)
    if (filters?.status) params.append('status', filters.status)

    const query = params.toString()
    const url = query ? `/appointments?${query}` : '/appointments'
    const response = await apiClient.get<{ data: Appointment[] }>(url)
    return response.data.data || []
  }

  const createAppointment = async (
    payload: CreateAppointmentRequest,
  ): Promise<Appointment> => {
    const response = await apiClient.post<{ data: Appointment }>(
      '/appointments',
      payload,
    )
    return response.data.data
  }

  const updateAppointmentStatus = async (
    id: string,
    status: AppointmentStatus,
  ): Promise<void> => {
    await apiClient.patch(`/appointments/${id}/status`, { status })
  }

  const getAppointmentById = async (id: string): Promise<Appointment> => {
    const response = await apiClient.get<{ data: Appointment }>(
      `/appointments/${id}`,
    )
    return response.data.data
  }

  return {
    getAppointments,
    createAppointment,
    updateAppointmentStatus,
    getAppointmentById,
  }
}
