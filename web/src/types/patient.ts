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
  phone: string
  date_of_birth?: string
  gender: Gender
  blood_type?: BloodType
  chronic_diseases?: string
  allergies?: PatientAllergy[]
}

export interface CreatePatientPayload {
  prefix: string
  full_name: string
  phone: string
  date_of_birth?: string
  gender: Gender
  blood_type?: BloodType
  chronic_diseases?: string
}

export interface AddPatientAllergyPayload {
  medication_id: string
  reaction_note: string
  severity: AllergySeverity
}
