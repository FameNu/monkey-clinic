import { create } from 'zustand'
import { StaffPayload, StaffRecord, StaffFilters } from '@/types'
import { staffApi } from '@/lib/api/staff-api'
import { getErrorMessage } from '@/lib/axios-instance'

interface StaffState {
  staff: StaffRecord[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fetchStaff: (filters?: StaffFilters) => Promise<void>
  createStaff: (payload: StaffPayload) => Promise<StaffRecord>
  updateStaff: (id: string, payload: StaffPayload) => Promise<StaffRecord>
}

const api = staffApi()

export const useStaffStore = create<StaffState>()((set) => ({
  staff: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  fetchStaff: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      set({ staff: await api.getStaff(filters), isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'โหลดรายชื่อบุคลากรไม่สำเร็จ') })
    }
  },
  createStaff: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const created = await api.createStaff(payload)
      set((state) => ({ staff: [created, ...state.staff], isSubmitting: false }))
      return created
    } catch (error) {
      set({ isSubmitting: false, error: getErrorMessage(error, 'เพิ่มบุคลากรไม่สำเร็จ') })
      throw new Error(getErrorMessage(error, 'เพิ่มบุคลากรไม่สำเร็จ'))
    }
  },
  updateStaff: async (id, payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const updated = await api.updateStaff(id, payload)
      set((state) => ({ staff: state.staff.map((person) => person.id === id ? updated : person), isSubmitting: false }))
      return updated
    } catch (error) {
      set({ isSubmitting: false, error: getErrorMessage(error, 'แก้ไขข้อมูลบุคลากรไม่สำเร็จ') })
      throw new Error(getErrorMessage(error, 'แก้ไขข้อมูลบุคลากรไม่สำเร็จ'))
    }
  },
}))
