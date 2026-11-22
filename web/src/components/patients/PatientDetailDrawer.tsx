'use client'

import { useEffect, useState } from 'react'

import { usePatientStore } from '@/store/usePatientStore'
import { AllergySeverity, Patient } from '@/types'

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined'
import AllergySeverityBadge from '@/components/common/StatusBadge/AllergySeverityBadge'

interface Props {
  patient: Patient | null
  onClose: () => void
  canEditAllergy: boolean
}

export default function PatientDetailDrawer({
  patient,
  onClose,
  canEditAllergy,
}: Props) {
  const medications = usePatientStore((state) => state.medicationOptions)
  const fetchMedicationOptions = usePatientStore(
    (state) => state.fetchMedicationOptions,
  )
  const addPatientAllergy = usePatientStore((state) => state.addPatientAllergy)
  const isSubmitting = usePatientStore((state) => state.isSubmitting)

  const [medicationId, setMedicationId] = useState('')
  const [severity, setSeverity] = useState<AllergySeverity>('moderate')
  const [reactionNote, setReactionNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!patient || !canEditAllergy) return
    fetchMedicationOptions()
  }, [patient, canEditAllergy, fetchMedicationOptions])

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return
    setFormError(null)

    try {
      await addPatientAllergy(patient.id, {
        medication_id: medicationId,
        severity,
        reaction_note: reactionNote.trim(),
      })
      setMedicationId('')
      setSeverity('moderate')
      setReactionNote('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'บันทึกข้อมูลไม่สำเร็จ')
    }
  }

  return (
    <Drawer anchor='right' open={Boolean(patient)} onClose={onClose}>
      {patient && (
        <Box sx={{ width: { xs: '100vw', sm: 460 }, p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Chip
                label={patient.hn_code}
                color='primary'
                size='small'
                sx={{ mb: 0.5 }}
              />
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {patient.prefix}
                {patient.full_name}
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* General Info */}
          <Typography
            variant='subtitle2'
            color='text.secondary'
            sx={{ mb: 1, fontWeight: 700 }}
          >
            ข้อมูลทั่วไป
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack spacing={1}>
              <Typography variant='body2'>
                <strong>เบอร์โทรศัพท์:</strong> {patient.phone}
              </Typography>
              <Typography variant='body2'>
                <strong>เพศ:</strong>{' '}
                {patient.gender === 'male' ? 'ชาย' : 'หญิง'}
              </Typography>
              <Typography variant='body2'>
                <strong>วันเกิด:</strong>{' '}
                {patient.date_of_birth
                  ? patient.date_of_birth.split('T')[0]
                  : '-'}
              </Typography>
              <Typography variant='body2'>
                <strong>กรุ๊ปเลือด:</strong> {patient.blood_type || 'ไม่ระบุ'}
              </Typography>
              <Typography variant='body2'>
                <strong>โรคประจำตัว:</strong>{' '}
                {patient.chronic_diseases || 'ไม่มี'}
              </Typography>
            </Stack>
          </Paper>

          {/* Allergies List */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <WarningAmberIcon color='error' fontSize='small' />
            <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
              ประวัติการแพ้ยา ({patient.allergies?.length || 0} รายการ)
            </Typography>
          </Box>

          {!patient.allergies || patient.allergies.length === 0 ? (
            <Alert severity='success' sx={{ mb: 3 }}>
              ไม่มีประวัติการแพ้ยาในระบบ
            </Alert>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {patient.allergies.map((allergy) => (
                <Paper
                  key={allergy.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'error.light',
                    bgcolor: '#fff5f5',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {allergy.medication?.name || 'ไม่ระบุชื่อยา'}
                    </Typography>
                    <AllergySeverityBadge severity={allergy.severity} />
                  </Box>
                  <Typography variant='caption' color='text.secondary'>
                    อาการที่แพ้: {allergy.reaction_note}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Add Allergy Form */}
          {canEditAllergy && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 700 }}>
                เพิ่มประวัติการแพ้ยา
              </Typography>

              {formError && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}

              <Box
                component='form'
                onSubmit={handleAddAllergy}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  select
                  label='เลือกตัวยาที่แพ้'
                  size='small'
                  value={medicationId}
                  onChange={(e) => setMedicationId(e.target.value)}
                  required
                  fullWidth
                >
                  {medications.map((med) => (
                    <MenuItem key={med.id} value={med.id}>
                      {med.name} ({med.generic_name || med.code})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label='ระดับความรุนแรง'
                  size='small'
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as AllergySeverity)
                  }
                  required
                  fullWidth
                >
                  <MenuItem value='mild'>เล็กน้อย (Mild)</MenuItem>
                  <MenuItem value='moderate'>ปานกลาง (Moderate)</MenuItem>
                  <MenuItem value='severe'>รุนแรง (Severe)</MenuItem>
                </TextField>

                <TextField
                  label='อาการที่พบ'
                  size='small'
                  value={reactionNote}
                  onChange={(e) => setReactionNote(e.target.value)}
                  placeholder='เช่น ผื่นขึ้นตามตัว, หายใจติดขัด'
                  required
                  fullWidth
                />

                <Button
                  type='submit'
                  variant='outlined'
                  color='error'
                  startIcon={<AddCircleOutlineIcon />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกประวัติแพ้ยา'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Drawer>
  )
}
