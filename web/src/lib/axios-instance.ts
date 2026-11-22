import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/store/useAuthStore'

export class ApiError extends Error {
  statusCode?: number
  fieldErrors?: Record<string, string>

  constructor(
    message: string,
    statusCode?: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.fieldErrors = fieldErrors
  }
}

let logoutHandler: (() => void) | null = null

export const setupAxiosInterceptor = (logoutFn: () => void) => {
  logoutHandler = logoutFn
}

const triggerLogout = () => {
  if (logoutHandler) {
    logoutHandler()
  } else {
    useAuthStore.getState().logout()
  }

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Handle unauthorized (session expired) and unify error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      message?: string | Record<string, string>
      errors?: Record<string, string>
    }>,
  ) => {
    const statusCode = error.response?.status
    const requestUrl = error.config?.url || ''

    if (statusCode === 401 && !requestUrl.includes('/auth/login')) {
      triggerLogout()
      return Promise.reject(
        new ApiError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', 401),
      )
    }

    // 2. แกะข้อความ Error จาก Backend (รองรับทั้ง message string และ validation errors object)
    const responseData = error.response?.data
    let message = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'
    let fieldErrors: Record<string, string> | undefined

    if (typeof responseData?.message === 'string') {
      message = responseData.message
    } else if (
      responseData?.message &&
      typeof responseData.message === 'object'
    ) {
      fieldErrors = responseData.message
      message = Object.values(responseData.message)[0] || 'ข้อมูลไม่ถูกต้อง'
    } else if (
      responseData?.errors &&
      typeof responseData.errors === 'object'
    ) {
      fieldErrors = responseData.errors
      message = Object.values(responseData.errors)[0] || 'ข้อมูลไม่ถูกต้อง'
    } else if (error.code === 'ECONNABORTED') {
      message = 'การเชื่อมต่อใช้เวลานานเกินกำหนด กรุณาลองใหม่อีกครั้ง'
    }

    return Promise.reject(new ApiError(message, statusCode, fieldErrors))
  },
)

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return error.message || fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export default axiosInstance