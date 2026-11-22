'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/ReceiptLong'
import { useAuthStore } from '@/store/useAuthStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useAppointmentStore } from '@/store/useAppointmentStore'
import DashboardAuthGuard from '@/components/auth/DashboardAuthGuard'
import EmptyState from '@/components/common/StateViews/EmptyState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import LoadingState from '@/components/common/StateViews/LoadingState'
import PaymentStatusBadge from '@/components/common/StatusBadge/PaymentStatusBadge'
import { CreateInvoiceModal } from '@/components/invoices/CreateInvoiceModal'
import { PaymentModal } from '@/components/invoices/PaymentModal'
import { Invoice } from '@/types'

export default function InvoicesPage() { return <DashboardAuthGuard><InvoiceContent /></DashboardAuthGuard> }
function InvoiceContent() {
  const role = useAuthStore((state) => state.user?.role)
  const invoices = useInvoiceStore((state) => state.invoices)
  const isLoading = useInvoiceStore((state) => state.isLoading)
  const error = useInvoiceStore((state) => state.error)
  const fetchInvoices = useInvoiceStore((state) => state.fetchInvoices)
  const appointments = useAppointmentStore((state) => state.appointments)
  const fetchAppointments = useAppointmentStore((state) => state.fetchAppointments)
  const [createOpen, setCreateOpen] = useState(false)
  const [paying, setPaying] = useState<Invoice | null>(null)
  useEffect(() => { void fetchInvoices(); void fetchAppointments() }, [fetchInvoices, fetchAppointments])
  const eligibleAppointments = useMemo(() => appointments.filter((appointment) => appointment.status === 'completed' && !appointment.invoice), [appointments])
  const canManage = role === 'admin' || role === 'receptionist'
  const reload = () => { void fetchInvoices(); void fetchAppointments() }
  return <Box>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}><Box><Typography variant='h5' sx={{ fontWeight: 700 }}>การเงินและใบแจ้งหนี้</Typography><Typography variant='body2' color='text.secondary'>ออกใบแจ้งหนี้สำหรับการตรวจและบันทึกการชำระเงิน</Typography></Box>{canManage && <Button variant='contained' startIcon={<AddIcon />} disabled={eligibleAppointments.length === 0} onClick={() => setCreateOpen(true)}>สร้างใบแจ้งหนี้</Button>}</Box>
    {error ? <ErrorState message={error} onRetry={reload} /> : isLoading ? <LoadingState message='กำลังโหลดรายการใบแจ้งหนี้...' /> : invoices.length === 0 ? <EmptyState title='ยังไม่มีใบแจ้งหนี้' description='ใบแจ้งหนี้จะปรากฏหลังสร้างจากนัดหมายที่ตรวจเสร็จแล้ว' /> : <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}><Table sx={{ minWidth: 1100 }}><TableHead sx={{ bgcolor: 'grey.50' }}><TableRow>{['เลขที่ / HN', 'ผู้ป่วย', 'อ้างอิงการตรวจ', 'ค่าตรวจ', 'ค่ายา', 'ยอดรวม', 'สถานะ', 'วิธีชำระ', 'จัดการ'].map((head) => <TableCell key={head} sx={{ fontWeight: 700 }}>{head}</TableCell>)}</TableRow></TableHead><TableBody>{invoices.map((invoice) => { const appointment = invoice.appointment; return <TableRow key={invoice.id} hover><TableCell><Typography sx={{ fontWeight: 700 }}>{invoice.invoice_number}</Typography><Typography variant='caption' color='text.secondary'>{appointment?.patient?.hn_code || '-'}</Typography></TableCell><TableCell>{appointment?.patient ? `${appointment.patient.prefix}${appointment.patient.full_name}` : '-'}</TableCell><TableCell><Typography variant='body2'>{appointment?.appointment_date || '-'}</Typography><Typography variant='caption' color='text.secondary'>{appointment?.medical_record?.diagnosis || `นัดหมาย ${invoice.appointment_id.slice(0, 8)}`}</Typography></TableCell><TableCell>{invoice.doctor_fee.toLocaleString()} ฿</TableCell><TableCell>{invoice.medication_total.toLocaleString()} ฿</TableCell><TableCell sx={{ fontWeight: 700 }}>{invoice.total_amount.toLocaleString()} ฿</TableCell><TableCell><PaymentStatusBadge status={invoice.payment_status} /></TableCell><TableCell>{invoice.payment_method || '-'}</TableCell><TableCell>{canManage && invoice.payment_status === 'unpaid' && <Button size='small' variant='outlined' onClick={() => setPaying(invoice)}>รับชำระ</Button>}</TableCell></TableRow> })}</TableBody></Table></TableContainer>}
    {error && <Alert severity='error' sx={{ mt: 2 }}>{error}</Alert>}
    <CreateInvoiceModal open={createOpen} appointments={eligibleAppointments} onClose={() => { setCreateOpen(false); reload() }} /><PaymentModal invoice={paying} onClose={() => { setPaying(null); void fetchInvoices() }} />
  </Box>
}
