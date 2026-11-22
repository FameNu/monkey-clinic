'use client'

import { Chip, ChipProps } from '@mui/material'

interface PaymentStatusBadgeProps {
  status: 'unpaid' | 'paid' | 'cancelled'
}

interface StatusMapping {
  label: string
  color: ChipProps['color']
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const map: Record<string, StatusMapping> = {
    unpaid: { label: 'รอชำระเงิน', color: 'warning' },
    paid: { label: 'ชำระแล้ว', color: 'success' },
    cancelled: { label: 'ยกเลิก', color: 'default' },
  }
  const cfg: StatusMapping = map[status] ?? { label: status, color: 'default' }

  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      size='small'
      sx={{ fontWeight: 600 }}
    />
  )
}
