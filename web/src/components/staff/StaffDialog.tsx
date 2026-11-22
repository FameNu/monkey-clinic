'use client'

import { FormEvent, useState } from 'react'
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
import { StaffPayload, StaffRecord, StaffSchedule, UserRole } from '@/types'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import { useStaffStore } from '@/store/useStaffStore'

interface Props {
  open: boolean
  staff: StaffRecord | null
  isSelf?: boolean
  onClose: () => void
}

const initialPayload: StaffPayload = {
  email: '',
  password: '',
  prefix: '',
  full_name: '',
  phone: '',
  role: 'receptionist',
  is_active: true,
  specialization: '',
  license_number: '',
  consultation_fee: 500,
  doctor_notes: '',
  schedules: [],
}

const weekdays = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
]

const staffPayload = (staff: StaffRecord | null): StaffPayload =>
  staff
    ? {
        email: staff.email,
        password: '',
        prefix: staff.prefix,
        full_name: staff.full_name,
        phone: staff.phone ?? '',
        role: staff.role,
        is_active: staff.is_active,
        specialization: staff.doctor?.specialization ?? '',
        license_number: staff.doctor?.license_number ?? '',
        consultation_fee: staff.doctor?.consultation_fee ?? 500,
        doctor_notes: staff.doctor?.notes ?? '',
        schedules: (staff.doctor?.schedules ?? []).map(
          ({ day_of_week, start_time, end_time, slot_duration_min }) => ({
            day_of_week,
            start_time,
            end_time,
            slot_duration_min,
          }),
        ),
      }
    : initialPayload

export function StaffDialog({ open, staff, isSelf = false, onClose }: Props) {
  const { createStaff, updateStaff, isSubmitting } = useStaffStore()
  const [payload, setPayload] = useState<StaffPayload>(() =>
    staffPayload(staff),
  )
  const [error, setError] = useState<string | null>(null)

  const updateSchedule = <K extends keyof StaffSchedule>(
    index: number,
    key: K,
    value: StaffSchedule[K],
  ) => {
    setPayload((current) => ({
      ...current,
      schedules: (current.schedules ?? []).map((schedule, scheduleIndex) =>
        scheduleIndex === index ? { ...schedule, [key]: value } : schedule,
      ),
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      if (staff) await updateStaff(staff.id, payload)
      else await createStaff(payload)
      onClose()
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'บันทึกข้อมูลบุคลากรไม่สำเร็จ',
      )
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>
          {staff ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากร'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={1.5}>
            <LabeledTextField
              label='คำนำหน้า'
              value={payload.prefix}
              onChange={(e) =>
                setPayload({ ...payload, prefix: e.target.value })
              }
              required
            />
            <LabeledTextField
              label='ชื่อ - นามสกุล'
              value={payload.full_name}
              onChange={(e) =>
                setPayload({ ...payload, full_name: e.target.value })
              }
              required
            />
            <LabeledTextField
              label='อีเมล'
              type='email'
              value={payload.email}
              onChange={(e) =>
                setPayload({ ...payload, email: e.target.value })
              }
              required
            />
            <LabeledTextField
              label={
                staff ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่าน'
              }
              type='password'
              value={payload.password}
              onChange={(e) =>
                setPayload({ ...payload, password: e.target.value })
              }
              required={!staff}
              slotProps={{ htmlInput: { minLength: 6 } }}
            />
            <LabeledTextField
              label='โทรศัพท์'
              value={payload.phone}
              onChange={(e) =>
                setPayload({ ...payload, phone: e.target.value })
              }
            />
            <LabeledTextField
              select
              label='บทบาท'
              value={payload.role}
              onChange={(e) =>
                setPayload({ ...payload, role: e.target.value as UserRole })
              }
              required
              disabled={isSelf}
            >
              <MenuItem value='admin'>ผู้ดูแลระบบ</MenuItem>
              <MenuItem value='receptionist'>เจ้าหน้าที่ต้อนรับ</MenuItem>
              <MenuItem value='doctor'>แพทย์</MenuItem>
            </LabeledTextField>
            {payload.role === 'doctor' && (
              <>
                <LabeledTextField
                  label='สาขาเฉพาะทาง'
                  value={payload.specialization}
                  onChange={(e) =>
                    setPayload({ ...payload, specialization: e.target.value })
                  }
                  required
                />
                <LabeledTextField
                  label='เลขใบอนุญาต'
                  value={payload.license_number}
                  onChange={(e) =>
                    setPayload({ ...payload, license_number: e.target.value })
                  }
                  required
                />
                <LabeledTextField
                  label='ค่าตรวจ (บาท)'
                  type='number'
                  value={payload.consultation_fee}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      consultation_fee: Number(e.target.value),
                    })
                  }
                  required
                  slotProps={{ htmlInput: { min: 1, step: '0.01' } }}
                />
                <LabeledTextField
                  label='หมายเหตุแพทย์'
                  value={payload.doctor_notes}
                  onChange={(e) =>
                    setPayload({ ...payload, doctor_notes: e.target.value })
                  }
                  multiline
                  rows={2}
                />
              </>
            )}
          </Stack>

          {payload.role === 'doctor' && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <DialogTitle component='h3' sx={{ p: 0, fontSize: '1rem' }}>
                  ตารางเวลาตรวจ
                </DialogTitle>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setPayload({
                      ...payload,
                      schedules: [
                        ...(payload.schedules ?? []),
                        {
                          day_of_week: 1,
                          start_time: '09:00',
                          end_time: '17:00',
                          slot_duration_min: 30,
                        },
                      ],
                    })
                  }
                >
                  เพิ่มวัน
                </Button>
              </Box>
              {(payload.schedules ?? []).map((schedule, index) => (
                <Box
                  key={`${index}-${schedule.day_of_week}`}
                  sx={{
                    mb: 1.5,
                    display: 'grid',
                    gap: 1.5,
                    alignItems: 'start',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1.2fr 1fr 1fr 1fr auto',
                    },
                  }}
                >
                  <LabeledTextField
                    select
                    label='วัน'
                    value={schedule.day_of_week}
                    onChange={(e) =>
                      updateSchedule(
                        index,
                        'day_of_week',
                        Number(e.target.value),
                      )
                    }
                  >
                    {weekdays.map((day, dayIndex) => (
                      <MenuItem key={day} value={dayIndex}>
                        {day}
                      </MenuItem>
                    ))}
                  </LabeledTextField>
                  <LabeledTextField
                    label='เริ่ม'
                    type='time'
                    value={schedule.start_time}
                    onChange={(e) =>
                      updateSchedule(index, 'start_time', e.target.value)
                    }
                    required
                  />
                  <LabeledTextField
                    label='สิ้นสุด'
                    type='time'
                    value={schedule.end_time}
                    onChange={(e) =>
                      updateSchedule(index, 'end_time', e.target.value)
                    }
                    required
                  />
                  <LabeledTextField
                    label='นาที/คิว'
                    type='number'
                    value={schedule.slot_duration_min}
                    onChange={(e) =>
                      updateSchedule(
                        index,
                        'slot_duration_min',
                        Number(e.target.value),
                      )
                    }
                    required
                    slotProps={{ htmlInput: { min: 10 } }}
                  />
                  <IconButton
                    aria-label='ลบตารางเวลา'
                    color='error'
                    onClick={() =>
                      setPayload({
                        ...payload,
                        schedules: (payload.schedules ?? []).filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                    }
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
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
