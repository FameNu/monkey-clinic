'use client'

import { ReactNode, useEffect, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Paper, Typography } from '@mui/material'

import LoadingState from '@/components/common/StateViews/LoadingState'
import { useAuthStore } from '@/store/useAuthStore'
import { UserRole } from '@/types'

interface DashboardAuthGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export default function DashboardAuthGuard({
  children,
  allowedRoles,
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>ไม่มีสิทธิ์เข้าใช้งาน</Typography>
          <Typography color='text.secondary'>บัญชีของคุณไม่มีสิทธิ์เปิดหน้านี้</Typography>
        </Paper>
      </Box>
    )
  }

  return children
}
