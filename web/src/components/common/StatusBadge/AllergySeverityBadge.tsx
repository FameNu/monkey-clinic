'use client'

import { Chip, ChipProps } from '@mui/material'
import { AllergySeverity } from '@/types'

interface AllergySeverityBadgeProps {
  severity: AllergySeverity
}

interface StatusMapping {
  label: string
  color: ChipProps['color']
}

export default function AllergySeverityBadge({ severity }: AllergySeverityBadgeProps) {
  const map: Record<string, StatusMapping> = {
    mild: { label: 'แพ้เล็กน้อย', color: 'info' },
    moderate: { label: 'แพ้ปานกลาง', color: 'warning' },
    severe: { label: 'แพ้รุนแรง', color: 'error' },
  }
  const cfg: StatusMapping = map[severity] ?? {
    label: severity,
    color: 'default',
  }

  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      size='small'
      variant='outlined'
      sx={{ fontWeight: 600 }}
    />
  )
}
