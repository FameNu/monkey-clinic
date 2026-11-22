import axios from 'axios'
import { create } from 'zustand'
import {
  Medication,
  Patient,
  AddPatientAllergyPayload,
  CreatePatientPayload,
} from '@/types'
import { patientApi } from '@/lib/api/patient-api'
import { medicationApi } from '@/lib/api/medication-api'

type PatientState = {
  patients: Patient[]
  selectedPatient: Patient | null
  medicationOptions: Medication[]
  isLoading: boolean
  isDetailLoading: boolean
  isSubmitting: boolean
  error: string | null
}

type PatientActions = {
  fetchPatients: (search?: string) => Promise<void>
  fetchPatientById: (id: string) => Promise<void>
  fetchMedicationOptions: () => Promise<void>
  createPatient: (payload: CreatePatientPayload) => Promise<Patient>
  addPatientAllergy: (
    patientId: string,
    payload: AddPatientAllergyPayload,
  ) => Promise<void>
  clearSelectedPatient: () => void
  reset: () => void
}

const { getPatients, getPatientById, createPatient, addPatientAllergy } =
  patientApi()
const { getMedications } = medicationApi()

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (
    axios.isAxiosError<{ message?: string | Record<string, string> }>(error)
  ) {
    const msg = error.response?.data?.message
    if (typeof msg === 'string') return msg
  }
  return fallback
}

export const usePatientStore = create<PatientState & PatientActions>()(
  (set, get) => ({
    patients: [],
    selectedPatient: null,
    medicationOptions: [],
    isLoading: false,
    isDetailLoading: false,
    isSubmitting: false,
    error: null,

    fetchPatients: async (search) => {
      set({ isLoading: true, error: null })
      try {
        const data = await getPatients(search)
        set({ patients: data, isLoading: false })
      } catch (error) {
        set({
          isLoading: false,
          error: extractErrorMessage(
            error,
            'ไม่สามารถโหลดข้อมูลทะเบียนคนไข้ได้',
          ),
        })
      }
    },

    fetchPatientById: async (id) => {
      set({ isDetailLoading: true })
      try {
        const data = await getPatientById(id)
        set({ selectedPatient: data, isDetailLoading: false })
      } catch (error) {
        set({ isDetailLoading: false })
        throw new Error(
          extractErrorMessage(error, 'ไม่สามารถโหลดรายละเอียดคนไข้ได้'),
        )
      }
    },

    fetchMedicationOptions: async () => {
      if (get().medicationOptions.length > 0) return

      try {
        const data = await getMedications()
        set({ medicationOptions: data })
      } catch {
        set({ medicationOptions: [] })
      }
    },

    createPatient: async (payload) => {
      set({ isSubmitting: true })
      try {
        const newPatient = await createPatient(payload)
        set((state) => ({
          patients: [newPatient, ...state.patients],
          isSubmitting: false,
        }))
        return newPatient
      } catch (error) {
        set({ isSubmitting: false })
        throw new Error(
          extractErrorMessage(
            error,
            'ลงทะเบียนคนไข้ใหม่ไม่สำเร็จ กรุณาตรวจสอบข้อมูล',
          ),
        )
      }
    },

    addPatientAllergy: async (patientId, payload) => {
      set({ isSubmitting: true })
      try {
        const newAllergy = await addPatientAllergy(patientId, payload)
        const currentSelected = get().selectedPatient

        set((state) => ({
          isSubmitting: false,
          selectedPatient:
            currentSelected && currentSelected.id === patientId
              ? {
                  ...currentSelected,
                  allergies: [...(currentSelected.allergies || []), newAllergy],
                }
              : currentSelected,
          patients: state.patients.map((p) =>
            p.id === patientId
              ? { ...p, allergies: [...(p.allergies || []), newAllergy] }
              : p,
          ),
        }))
      } catch (error) {
        set({ isSubmitting: false })
        throw new Error(
          extractErrorMessage(error, 'บันทึกข้อมูลการแพ้ยาไม่สำเร็จ'),
        )
      }
    },

    clearSelectedPatient: () => set({ selectedPatient: null }),

    reset: () =>
      set({
        patients: [],
        selectedPatient: null,
        medicationOptions: [],
        isLoading: false,
        isDetailLoading: false,
        isSubmitting: false,
        error: null,
      }),
  }),
)
