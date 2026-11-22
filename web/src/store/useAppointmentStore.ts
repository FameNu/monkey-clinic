import { create } from 'zustand'
import {
  Appointment,
  AppointmentStatus,
  AppointmentFilters,
  CreateAppointmentRequest,
} from '@/types'
import { appointmentApi } from '@/lib/api/appointment-api'
import { getErrorMessage } from '@/lib/axios-instance'

type AppointmentState = {
  appointments: Appointment[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

type AppointmentActions = {
  fetchAppointments: (filters?: AppointmentFilters) => Promise<void>
  fetchAppointmentsByDate: (date: string) => Promise<void>
  createAppointment: (payload: CreateAppointmentRequest) => Promise<void>
  updateAppointmentStatus: (
    id: string,
    status: AppointmentStatus,
  ) => Promise<void>
  reset: () => void
}

const { getAppointments, createAppointment, updateAppointmentStatus } =
  appointmentApi()

export const useAppointmentStore = create<
  AppointmentState & AppointmentActions
>()((set) => ({
  appointments: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchAppointments: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      const data = await getAppointments(filters)
      set({ appointments: data, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'ไม่สามารถโหลดรายการนัดหมายได้'),
      })
    }
  },

  fetchAppointmentsByDate: async (date) => {
    set({ isLoading: true, error: null })
    try {
      const data = await getAppointments({ date })
      set({ appointments: data, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(
          error,
          'ไม่สามารถโหลดรายการนัดหมายประจำวันได้',
        ),
      })
    }
  },

  createAppointment: async (payload) => {
    set({ isSubmitting: true })
    try {
      await createAppointment(payload)
      set({ isSubmitting: false })
    } catch (error) {
      set({ isSubmitting: false })
      throw new Error(
        getErrorMessage(
          error,
          'ไม่สามารถสร้างนัดหมายได้ กรุณาตรวจสอบข้อมูลอีกครั้ง',
        ),
      )
    }
  },

  updateAppointmentStatus: async (id, status) => {
    try {
      await updateAppointmentStatus(id, status)
      set((state) => ({
        appointments: state.appointments.map((item) =>
          item.id === id ? { ...item, status } : item,
        ),
      }))
    } catch (error) {
      throw new Error(getErrorMessage(error, 'อัปเดตสถานะคิวไม่สำเร็จ'))
    }
  },

  reset: () => {
    set({
      appointments: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
    })
  },
}))
