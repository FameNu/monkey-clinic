import { create } from 'zustand'
import { CreateMedicationRequest, Medication } from '@/types'
import { medicationApi } from '@/lib/api/medication-api'
import { ApiError, getErrorMessage } from '@/lib/axios-instance'

type MedicationState = {
  medications: Medication[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fetchMedications: () => Promise<void>
  createMedication: (payload: CreateMedicationRequest) => Promise<void>
  updateStock: (id: string, addQuantity: number) => Promise<void>
}

const api = medicationApi()

export const useMedicationStore = create<MedicationState>()((set) => ({
  medications: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  fetchMedications: async () => {
    set({ isLoading: true, error: null })
    try {
      set({ medications: await api.getMedications(), isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'โหลดคลังยาไม่สำเร็จ') })
    }
  },
  createMedication: async (payload) => {
    set({ isSubmitting: true })
    try {
      const medication = await api.createMedication(payload)
      set((state) => ({ medications: [...state.medications, medication], isSubmitting: false }))
    } catch (error) {
      set({ isSubmitting: false })
      if (error instanceof ApiError) throw error
      throw new Error(getErrorMessage(error, 'เพิ่มยาไม่สำเร็จ'))
    }
  },
  updateStock: async (id, addQuantity) => {
    set({ isSubmitting: true })
    try {
      await api.restockMedication(id, { add_quantity: addQuantity })
      set((state) => ({
        medications: state.medications.map((med) => med.id === id
          ? { ...med, stock_quantity: med.stock_quantity + addQuantity }
          : med),
        isSubmitting: false,
      }))
    } catch (error) {
      set({ isSubmitting: false })
      if (error instanceof ApiError) throw error
      throw new Error(getErrorMessage(error, 'ปรับปรุงสต็อกยาไม่สำเร็จ'))
    }
  },
}))
