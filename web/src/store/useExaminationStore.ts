import { create } from 'zustand'
import {
  Appointment,
  MedicalRecord,
  Medication,
  Patient,
  CreateMedicalRecordPayload,
} from '@/types'
import { appointmentApi } from '@/lib/api/appointment-api'
import { patientApi } from '@/lib/api/patient-api'
import { medicationApi } from '@/lib/api/medication-api'
import { clinicApi } from '@/lib/api/clinic-api'
import { ApiError, getErrorMessage } from '@/lib/axios-instance'

type ExaminationState = {
  appointment: Appointment | null
  patient: Patient | null
  medicalHistory: Appointment[]
  medications: Medication[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

type ExaminationActions = {
  loadExaminationContext: (appointmentId: string) => Promise<void>
  submitMedicalRecord: (
    payload: CreateMedicalRecordPayload,
  ) => Promise<MedicalRecord>
  reset: () => void
}

const { getAppointmentById, updateAppointmentStatus } = appointmentApi()
const { getPatientById } = patientApi()
const { getMedications } = medicationApi()
const { createMedicalRecord, getPatientHistory } = clinicApi()

export const useExaminationStore = create<
  ExaminationState & ExaminationActions
>()((set, get) => ({
  appointment: null,
  patient: null,
  medicalHistory: [],
  medications: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  loadExaminationContext: async (appointmentId) => {
    set({ isLoading: true, error: null })
    try {
      const appointment = await getAppointmentById(appointmentId)

      let currentAppointment = appointment
      if (appointment.status === 'checked_in') {
        await updateAppointmentStatus(appointment.id, 'in_progress')
        currentAppointment = { ...appointment, status: 'in_progress' }
      }

      const [patient, medicalHistory, medications] = await Promise.all([
        getPatientById(appointment.patient_id),
        getPatientHistory(appointment.patient_id),
        getMedications(),
      ])

      set({
        appointment: currentAppointment,
        patient,
        medicalHistory,
        medications,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, 'ไม่สามารถโหลดข้อมูลห้องตรวจได้'),
      })
    }
  },

  submitMedicalRecord: async (payload) => {
    set({ isSubmitting: true })
    try {
      const record = await createMedicalRecord(payload)
      const currentAppt = get().appointment

      set({
        isSubmitting: false,
        appointment: currentAppt
          ? { ...currentAppt, status: 'completed' }
          : null,
      })
      return record
    } catch (error) {
      set({ isSubmitting: false })
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error(getErrorMessage(error, 'บันทึกผลการตรวจไม่สำเร็จ'))
    }
  },

  reset: () =>
    set({
      appointment: null,
      patient: null,
      medicalHistory: [],
      medications: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
    }),
}))
