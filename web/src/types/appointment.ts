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

export interface DashboardSummary {
  date: string
  total_patients: number
  today_appointments: number
  completed_today: number
  low_stock_meds: number
  today_revenue: number
}

export interface CreateAppointmentRequest {
  patient_id: string
  doctor_id: string
  appointment_date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
  reason?: string
}

export type AppointmentStatusFilter = AppointmentStatus | ''

export interface AppointmentFilters {
  date?: string // YYYY-MM-DD
  status?: AppointmentStatusFilter
}
