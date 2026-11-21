'use client'

import { ReactNode, useEffect, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'

import LoadingState from '@/components/common/StateViews/LoadingState'
import { useAuthStore } from '@/store/useAuthStore'

interface DashboardAuthGuardProps {
  children: ReactNode
}

export default function DashboardAuthGuard({
  children,
}: DashboardAuthGuardProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  useEffect(() => {
    if (hydrated && (!isAuthenticated || !user)) {
      router.replace('/login')
    }
  }, [hydrated, isAuthenticated, router, user])

  if (!hydrated || !isAuthenticated || !user) {
    return <LoadingState message='กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...' />
  }

  return children
}
