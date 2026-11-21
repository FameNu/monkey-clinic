import { Patient } from './patient'
import { Doctor } from './doctor'

export type AppointmentStatus =
  | 'scheduled'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Appointment {
  id: string
  patient_id: string
  patient?: Patient
  doctor_id: string
  doctor?: Doctor
  appointment_date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
  status: AppointmentStatus
  reason: string
}