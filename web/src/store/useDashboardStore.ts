import { create } from 'zustand'
import { DashboardSummary } from '@/types'
import { dashboardApi } from '@/lib/api/dashboard-api'
import { getErrorMessage } from '@/lib/axios-instance'

type DashboardState = {
  summary: DashboardSummary | null
  isLoading: boolean
  error: string | null
}

type DashboardStateActions = {
  fetchDashboardSummary: () => Promise<void>
  reset: () => void
}

const { getDashboardSummary } = dashboardApi()

export const useDashboardStore = create<
  DashboardState & DashboardStateActions
>()((set) => ({
  summary: null,
  isLoading: false,
  error: null,

  fetchDashboardSummary: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await getDashboardSummary()
      set({ summary: response, isLoading: false })
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        'ไม่สามารถโหลดข้อมูลภาพรวมคลินิกได้',
      )
      console.error('Error fetching dashboard summary:', error)
      set({ isLoading: false, error: errorMessage })
    }
  },

  reset: () => {
    set({ summary: null, isLoading: false, error: null })
  },
}))
