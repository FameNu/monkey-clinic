import { Medication } from './medication'

export interface PatientAllergy {
  id: string
  medication_id: string
  medication?: Medication
  reaction_note: string
  severity: 'mild' | 'moderate' | 'severe'
}

export interface Patient {
  id: string
  hn_code: string
  prefix: string
  full_name: string
  phone: string
  date_of_birth?: string
  gender: 'male' | 'female'
  blood_type?: 'A' | 'B' | 'AB' | 'O'
  chronic_diseases?: string
  allergies?: PatientAllergy[]
}