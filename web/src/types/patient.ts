import { Medication } from './medication'

export type AllergySeverity = 'mild' | 'moderate' | 'severe'
export type Gender = 'male' | 'female'
export type BloodType = 'A' | 'B' | 'AB' | 'O' | ''

export interface PatientAllergy {
  id: string
  medication_id: string
  medication?: Medication
  reaction_note: string
  severity: AllergySeverity
}

export interface Patient {
  id: string
  hn_code: string
  prefix: string
  full_name: string
  national_id?: string | null
  phone: string
  address?: string
  emergency_contact?: string
  date_of_birth?: string
  gender: Gender
  blood_type?: BloodType
  chronic_diseases?: string
  allergies?: PatientAllergy[]
}

export interface CreatePatientPayload {
  prefix: string
  full_name: string
  national_id?: string
  phone: string
  address?: string
  emergency_contact?: string
  date_of_birth?: string
  gender: Gender
  blood_type?: BloodType
  chronic_diseases?: string
}

export interface UpdatePatientPayload extends CreatePatientPayload {
  allergies: AddPatientAllergyPayload[]
}

export interface AddPatientAllergyPayload {
  medication_id: string
  reaction_note: string
  severity: AllergySeverity
}

export interface PrescriptionItem {
  id: string
  medical_record_id: string
  medication_id: string
  medication?: Medication
  quantity: number
  dosage_instruction: string
  unit_price: number
  created_at?: string
  updated_at?: string
}

export interface MedicalRecord {
  id: string
  appointment_id: string
  diagnosis: string
  symptoms?: string
  treatment_notes?: string
  prescriptions?: PrescriptionItem[]
  created_at?: string
  updated_at?: string
}

export interface PrescriptionInput {
  medication_id: string
  quantity: number
  dosage_instruction: string
}

export interface CreateMedicalRecordPayload {
  appointment_id: string
  diagnosis: string
  symptoms?: string
  treatment_notes?: string
  prescriptions: PrescriptionInput[]
  override_allergy_warning: boolean
}

export type CreateMedicalRecordRequest = CreateMedicalRecordPayload
