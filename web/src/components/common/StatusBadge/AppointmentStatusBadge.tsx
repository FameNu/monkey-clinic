'use client'

import { AppointmentStatus } from '@/types'
import { Chip, ChipProps } from '@mui/material'

interface AppointmentStatusProps {
  status: AppointmentStatus
}

const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: ChipProps['color'] }
> = {
  scheduled: { label: 'นัดหมายแล้ว', color: 'info' },
  checked_in: { label: 'เช็กอินแล้ว', color: 'warning' },
  in_progress: { label: 'กำลังตรวจ', color: 'primary' },
  completed: { label: 'ตรวจเสร็จสิ้น', color: 'success' },
  cancelled: { label: 'ยกเลิก', color: 'default' },
  no_show: { label: 'ไม่มาตามนัด', color: 'error' },
}

export function AppointmentStatusBadge({ status }: AppointmentStatusProps) {
  const config = APPOINTMENT_STATUS_CONFIG[status] ?? {
    label: status,
    color: 'default' as const,
  }

  return (
    <Chip
      label={config.label}
      color={config.color}
      size='small'
      sx={{ fontWeight: 600 }}
    />
  )
}
