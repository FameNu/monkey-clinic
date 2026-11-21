export type UserRole = 'admin' | 'receptionist' | 'doctor'

export interface User {
  id: string
  email: string
  prefix: string
  full_name: string
  role: UserRole
  is_active: boolean
}
