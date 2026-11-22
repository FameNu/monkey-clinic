import { create } from 'zustand'
import { CreateDoctorRequest, Doctor } from '@/types'
import { doctorApi } from '@/lib/api/doctor-api'
import { ApiError, getErrorMessage } from '@/lib/axios-instance'

type DoctorState = {
  doctors: Doctor[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fetchDoctors: () => Promise<void>
  createDoctor: (payload: CreateDoctorRequest) => Promise<Doctor>
}

const api = doctorApi()

export const useDoctorStore = create<DoctorState>()((set) => ({
  doctors: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  fetchDoctors: async () => {
    set({ isLoading: true, error: null })
    try {
      set({ doctors: await api.getDoctors(), isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'โหลดรายชื่อแพทย์ไม่สำเร็จ') })
    }
  },
  createDoctor: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const doctor = await api.createDoctor(payload)
      set((state) => ({ doctors: [doctor, ...state.doctors], isSubmitting: false }))
      return doctor
    } catch (error) {
      set({ isSubmitting: false })
      if (error instanceof ApiError) throw error
      throw new Error(getErrorMessage(error, 'เพิ่มแพทย์ไม่สำเร็จ'))
    }
  },
}))
