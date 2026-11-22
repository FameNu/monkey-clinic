'use client'

import { useEffect, useState } from 'react'

import { useAppointmentStore } from '@/store/useAppointmentStore'
import { useDoctorStore } from '@/store/useDoctorStore'
import { usePatientStore } from '@/store/usePatientStore'

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from '@mui/material'
import { LabeledTextField } from '@/components/common/LabeledTextField'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  defaultDate?: string
}

export function CreateAppointmentModal({
  open,
  onClose,
  onSuccess,
  defaultDate,
}: Props) {
  const { isSubmitting, createAppointment } = useAppointmentStore()

  const { patients, fetchPatients } = usePatientStore()
  const { doctors, fetchDoctors } = useDoctorStore()

  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState(
    defaultDate || new Date().toISOString().split('T')[0],
  )
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('09:30')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    Promise.all([fetchPatients(), fetchDoctors()]).catch(() => {
      setError('ไม่สามารถโหลดรายชื่อคนไข้หรือแพทย์ได้')
    })
  }, [open, fetchPatients, fetchDoctors])

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await createAppointment({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        reason,
      })
      setPatientId('')
      setDoctorId('')
      setReason('')
      onSuccess()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างนัดหมาย',
      )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      slotProps={{
        transition: {
          onEnter: () => {
            setError(null)
            if (defaultDate) setAppointmentDate(defaultDate)
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>สร้างนัดหมายใหม่</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}
          >
            <LabeledTextField
              select
              label='เลือกคนไข้'
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
              fullWidth
            >
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.hn_code} - {p.prefix}
                  {p.full_name} ({p.phone})
                </MenuItem>
              ))}
            </LabeledTextField>

            <LabeledTextField
              select
              label='เลือกแพทย์ผู้ตรวจ'
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
              fullWidth
            >
              {doctors
                .filter((d) => d.is_active)
                .map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.prefix}
                    {d.full_name} ({d.specialization})
                  </MenuItem>
                ))}
            </LabeledTextField>

            <LabeledTextField
              label='วันที่นัดหมาย'
              type='date'
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <LabeledTextField
                label='เวลาเริ่ม (HH:MM)'
                type='time'
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                fullWidth
              />
              <LabeledTextField
                label='เวลาสิ้นสุด (HH:MM)'
                type='time'
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                fullWidth
              />
            </Box>

            <LabeledTextField
              label='อาการเบื้องต้น / สาเหตุที่นัด'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color='inherit' disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการจองคิว'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
