export interface Doctor {
  id: string
  user_id?: string | null
  prefix: string
  full_name: string
  specialization: string
  license_number: string
  phone?: string
  consultation_fee: number
  is_active: boolean
}
