'use client'

import { FormEvent, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import {
  AllergySeverity,
  AddPatientAllergyPayload,
  Patient,
  UpdatePatientPayload,
} from '@/types'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import { usePatientStore } from '@/store/usePatientStore'
import { PREFIX_OPTIONS } from '@/common/selectionList'

interface Props {
  patient: Patient | null
  open: boolean
  onClose: () => void
}

const severityOptions: { value: AllergySeverity; label: string }[] = [
  { value: 'mild', label: 'เล็กน้อย' },
  { value: 'moderate', label: 'ปานกลาง' },
  { value: 'severe', label: 'รุนแรง' },
]

const emptyForm: UpdatePatientPayload = {
  prefix: '',
  full_name: '',
  national_id: '',
  phone: '',
  address: '',
  emergency_contact: '',
  date_of_birth: '',
  gender: 'male',
  blood_type: '',
  chronic_diseases: '',
  allergies: [],
}

export function EditPatientModal({ patient, open, onClose }: Props) {
  const {
    updatePatient,
    medicationOptions,
    fetchMedicationOptions,
    isSubmitting,
  } = usePatientStore()
  const [payload, setPayload] = useState<UpdatePatientPayload>(() =>
    patient
      ? {
          prefix: patient.prefix,
          full_name: patient.full_name,
          national_id: patient.national_id ?? '',
          phone: patient.phone,
          address: patient.address ?? '',
          emergency_contact: patient.emergency_contact ?? '',
          date_of_birth: patient.date_of_birth?.slice(0, 10) ?? '',
          gender: patient.gender,
          blood_type: patient.blood_type ?? '',
          chronic_diseases: patient.chronic_diseases ?? '',
          allergies: (patient.allergies ?? []).map(
            ({ medication_id, reaction_note, severity }) => ({
              medication_id,
              reaction_note,
              severity,
            }),
          ),
        }
      : emptyForm,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) void fetchMedicationOptions()
  }, [fetchMedicationOptions, open])

  const update = <K extends keyof UpdatePatientPayload>(
    key: K,
    value: UpdatePatientPayload[K],
  ) => {
    setPayload((current) => ({ ...current, [key]: value }))
  }

  const updateAllergy = <K extends keyof AddPatientAllergyPayload>(
    index: number,
    key: K,
    value: AddPatientAllergyPayload[K],
  ) => {
    setPayload((current) => ({
      ...current,
      allergies: current.allergies.map((allergy, itemIndex) =>
        itemIndex === index ? { ...allergy, [key]: value } : allergy,
      ),
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!patient) return
    setError(null)
    try {
      await updatePatient(patient.id, payload)
      onClose()
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'แก้ไขข้อมูลคนไข้ไม่สำเร็จ',
      )
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>แก้ไขข้อมูลคนไข้</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <LabeledTextField
                select
                label='คำนำหน้า'
                value={payload.prefix}
                onChange={(e) => update('prefix', e.target.value)}
                required
                sx={{ minWidth: 130 }}
              >
                {PREFIX_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </LabeledTextField>

              <LabeledTextField
                label='ชื่อ - นามสกุล'
                value={payload.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                required
                fullWidth
              />
            </Box>
            <LabeledTextField
              label='เลขบัตรประชาชน / หนังสือเดินทาง'
              value={payload.national_id}
              onChange={(e) => update('national_id', e.target.value)}
            />
            <LabeledTextField
              label='เบอร์โทรศัพท์'
              value={payload.phone}
              onChange={(e) => update('phone', e.target.value)}
              required
            />
            <LabeledTextField
              label='วันเดือนปีเกิด'
              type='date'
              value={payload.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
            />
            <LabeledTextField
              select
              label='เพศ'
              value={payload.gender}
              onChange={(e) =>
                update('gender', e.target.value as 'male' | 'female')
              }
              required
            >
              <MenuItem value='male'>ชาย</MenuItem>
              <MenuItem value='female'>หญิง</MenuItem>
            </LabeledTextField>
            <LabeledTextField
              select
              label='กรุ๊ปเลือด'
              value={payload.blood_type}
              onChange={(e) =>
                update(
                  'blood_type',
                  e.target.value as UpdatePatientPayload['blood_type'],
                )
              }
            >
              <MenuItem value=''>ไม่ระบุ</MenuItem>
              {['A', 'B', 'AB', 'O'].map((bloodType) => (
                <MenuItem key={bloodType} value={bloodType}>
                  {bloodType}
                </MenuItem>
              ))}
            </LabeledTextField>
            <LabeledTextField
              label='ผู้ติดต่อฉุกเฉิน'
              value={payload.emergency_contact}
              onChange={(e) => update('emergency_contact', e.target.value)}
            />
            <LabeledTextField
              label='ที่อยู่'
              value={payload.address}
              onChange={(e) => update('address', e.target.value)}
              multiline
              rows={2}
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
            <LabeledTextField
              label='โรคประจำตัว'
              value={payload.chronic_diseases}
              onChange={(e) => update('chronic_diseases', e.target.value)}
              multiline
              rows={2}
              sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}
            />
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <DialogTitle component='h3' sx={{ p: 0, fontSize: '1rem' }}>
                ประวัติแพ้ยา
              </DialogTitle>
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  update('allergies', [
                    ...payload.allergies,
                    {
                      medication_id: '',
                      reaction_note: '',
                      severity: 'moderate',
                    },
                  ])
                }
              >
                เพิ่มรายการแพ้ยา
              </Button>
            </Box>
            {payload.allergies.map((allergy, index) => (
              <Box
                key={`${allergy.medication_id}-${index}`}
                sx={{
                  mb: 1.5,
                  display: 'grid',
                  gap: 1.5,
                  alignItems: 'start',
                  gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr 1fr auto' },
                }}
              >
                <LabeledTextField
                  select
                  label='ยาที่แพ้'
                  value={allergy.medication_id}
                  onChange={(e) =>
                    updateAllergy(index, 'medication_id', e.target.value)
                  }
                  required
                >
                  {medicationOptions.map((medication) => (
                    <MenuItem key={medication.id} value={medication.id}>
                      {medication.name} ({medication.generic_name})
                    </MenuItem>
                  ))}
                </LabeledTextField>
                <LabeledTextField
                  label='อาการที่พบ'
                  value={allergy.reaction_note}
                  onChange={(e) =>
                    updateAllergy(index, 'reaction_note', e.target.value)
                  }
                  required
                />
                <LabeledTextField
                  select
                  label='ระดับความรุนแรง'
                  value={allergy.severity}
                  onChange={(e) =>
                    updateAllergy(
                      index,
                      'severity',
                      e.target.value as AllergySeverity,
                    )
                  }
                  required
                >
                  {severityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </LabeledTextField>
                <IconButton
                  aria-label='ลบประวัติแพ้ยา'
                  color='error'
                  onClick={() =>
                    update(
                      'allergies',
                      payload.allergies.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
