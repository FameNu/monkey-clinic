export type UserRole = 'admin' | 'receptionist' | 'doctor'

export interface User {
  id: string
  email: string
  prefix: string
  full_name: string
  phone?: string
  role: UserRole
  is_active: boolean
}

export interface StaffSchedule {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_min: number
}

export interface StaffDoctorProfile {
  id: string
  user_id?: string | null
  prefix: string
  full_name: string
  specialization: string
  license_number: string
  phone?: string
  consultation_fee: number
  notes?: string
  is_active: boolean
  schedules?: StaffSchedule[]
}

export interface StaffRecord extends User {
  doctor?: StaffDoctorProfile
}

export interface StaffPayload {
  email: string
  password?: string
  prefix: string
  full_name: string
  phone: string
  role: UserRole
  is_active?: boolean
  specialization?: string
  license_number?: string
  consultation_fee?: number
  doctor_notes?: string
  schedules?: StaffSchedule[]
}

export interface StaffFilters {
  role?: string
  active?: boolean
  search?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}
