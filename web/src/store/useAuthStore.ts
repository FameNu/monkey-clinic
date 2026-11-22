import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { authApi } from '@/lib/api/auth-api'
import { getErrorMessage } from '@/lib/axios-instance'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginError: string | null
  login: (email: string, password: string) => Promise<void>
  clearLoginError: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginError: null,
      login: async (email, password) => {
        set({ isLoading: true, loginError: null })
        try {
          const { token, user } = await authApi.login(email, password)
          set({ token, user, isAuthenticated: true, isLoading: false })
        } catch (error: unknown) {
          set({
            isLoading: false,
            loginError: getErrorMessage(
              error,
              'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
            ),
          })
        }
      },
      clearLoginError: () => set({ loginError: null }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          loginError: null,
        }),
    }),
    {
      name: 'monkey-clinic-auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
