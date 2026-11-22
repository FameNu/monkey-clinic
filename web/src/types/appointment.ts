import { MedicalRecord, Patient } from './patient'
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
  medical_record?: MedicalRecord
  invoice?: Invoice
}

export interface Invoice {
  id: string
  invoice_number: string
  appointment_id: string
  appointment?: Appointment
  doctor_fee: number
  medication_total: number
  discount: number
  total_amount: number
  payment_method?: PaymentMethod | ''
  payment_status: PaymentStatus
  paid_at?: string | null
  created_at?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export type PaymentStatus = 'unpaid' | 'paid' | 'cancelled'
export type PaymentMethod = 'cash' | 'promptpay' | 'credit_card'

export interface CreateInvoiceRequest {
  appointment_id: string
  discount: number
}

export interface PayInvoiceRequest {
  payment_method: PaymentMethod
}

export interface DashboardSummary {
  date: string
  total_patients: number
  today_appointments: number
  completed_today: number
  low_stock_meds: number
  today_revenue: number
  patients_visited: number
  appointment_statuses: {
    completed: number
    waiting: number
    scheduled: number
    checked_in: number
    in_progress: number
    cancelled: number
    no_show: number
  }
  revenue: {
    consultation_fees: number
    medication_sales: number
    billed_total: number
    paid_total: number
    unpaid_total: number
    collected_on_date: number
  }
  visits: DashboardVisit[]
}

export interface DashboardVisit {
  appointment_id: string
  appointment_time: string
  patient_id: string
  patient_name: string
  hn_code: string
  doctor_name: string
  diagnosis: string
  visit_status: AppointmentStatus
  billed_amount: number
  payment_status: 'unbilled' | 'unpaid' | 'paid' | 'cancelled'
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
