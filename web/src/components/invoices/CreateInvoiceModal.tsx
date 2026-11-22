'use client'

import { FormEvent, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem } from '@mui/material'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import { Appointment } from '@/types'
import { useInvoiceStore } from '@/store/useInvoiceStore'

interface Props { open: boolean; appointments: Appointment[]; onClose: () => void }
export function CreateInvoiceModal({ open, appointments, onClose }: Props) {
  const createInvoice = useInvoiceStore((state) => state.createInvoice)
  const isSubmitting = useInvoiceStore((state) => state.isSubmitting)
  const [appointmentId, setAppointmentId] = useState('')
  const [discount, setDiscount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { await createInvoice({ appointment_id: appointmentId, discount }); setAppointmentId(''); setDiscount(0); onClose() } catch (reason) { setError(reason instanceof Error ? reason.message : 'สร้างใบแจ้งหนี้ไม่สำเร็จ') } }
  return <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth><form onSubmit={submit}><DialogTitle>สร้างใบแจ้งหนี้</DialogTitle><DialogContent dividers>{error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}<LabeledTextField select fullWidth label='นัดหมายที่ตรวจเสร็จแล้ว' value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} required sx={{ mt: 1, mb: 2 }}>{appointments.map((appointment) => <MenuItem key={appointment.id} value={appointment.id}>{appointment.appointment_date} · {appointment.patient?.hn_code || '-'} · {appointment.patient?.prefix}{appointment.patient?.full_name}</MenuItem>)}</LabeledTextField><LabeledTextField fullWidth label='ส่วนลด (บาท)' type='number' slotProps={{ htmlInput: { min: 0, step: '0.01' } }} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></DialogContent><DialogActions><Button onClick={onClose} disabled={isSubmitting}>ยกเลิก</Button><Button type='submit' variant='contained' disabled={isSubmitting || !appointmentId}>สร้างใบแจ้งหนี้</Button></DialogActions></form></Dialog>
}
