export interface Doctor {
  id: string
  user_id?: string | null
  user?: { email: string }
  prefix: string
  full_name: string
  specialization: string
  license_number: string
  phone?: string
  consultation_fee: number
  is_active: boolean
}

export interface CreateDoctorRequest {
  create_account: boolean
  email?: string
  password?: string
  prefix: string
  full_name: string
  specialization: string
  license_number: string
  phone?: string
  consultation_fee: number
}
