'use client'

import { Patient } from '@/types'
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import AllergySeverityBadge from '@/components/common/StatusBadge/AllergySeverityBadge'

interface Props {
  patient: Patient
}

export function PatientAllergyBanner({ patient }: Props) {
  const allergies = patient.allergies || []

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider' }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Chip label={patient.hn_code} color='primary' size='small' />
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              {patient.prefix}
              {patient.full_name}
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary'>
            เพศ: {patient.gender === 'male' ? 'ชาย' : 'หญิง'} | กรุ๊ปเลือด:{' '}
            {patient.blood_type || 'ไม่ระบุ'} | เบอร์โทร: {patient.phone} |
            โรคประจำตัว: <strong>{patient.chronic_diseases || 'ไม่มี'}</strong>
          </Typography>
        </Box>
      </Box>

      {allergies.length === 0 ? (
        <Alert icon={<CheckCircleOutlineIcon />} severity='success'>
          ไม่พบประวัติการแพ้ยาในระบบ
        </Alert>
      ) : (
        <Alert
          icon={<WarningAmberIcon />}
          severity='error'
          sx={{ border: '1px solid', borderColor: 'error.main' }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>
            คำเตือน: ผู้ป่วยมีประวัติการแพ้ยา ({allergies.length} รายการ)
          </AlertTitle>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {allergies.map((allergy) => (
              <Box
                key={allergy.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography variant='body2' sx={{ fontWeight: 700 }}>
                  • {allergy.medication?.name || 'ไม่ระบุชื่อยา'}
                  {allergy.medication?.generic_name
                    ? ` (${allergy.medication.generic_name})`
                    : ''}
                </Typography>
                <AllergySeverityBadge severity={allergy.severity} />
                <Typography variant='body2' color='text.secondary'>
                  — อาการ: {allergy.reaction_note}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Alert>
      )}
    </Paper>
  )
}
