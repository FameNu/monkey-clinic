'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DashboardAuthGuard from '@/components/auth/DashboardAuthGuard'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import EmptyState from '@/components/common/StateViews/EmptyState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import LoadingState from '@/components/common/StateViews/LoadingState'
import { AppointmentStatusBadge } from '@/components/common/StatusBadge/AppointmentStatusBadge'
import { useDashboardStore } from '@/store/useDashboardStore'

const bangkokDate = (offsetDays = 0) => {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const formatCurrency = (amount: number) =>
  `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`

export default function DashboardPage() {
  return (
    <DashboardAuthGuard allowedRoles={['admin']}>
      <DashboardContent />
    </DashboardAuthGuard>
  )
}

function DashboardContent() {
  const router = useRouter()
  const { summary, isLoading, error, fetchDashboardSummary } =
    useDashboardStore()
  const [selectedDate, setSelectedDate] = useState(() => bangkokDate())

  const loadSummary = useCallback(
    () => fetchDashboardSummary(selectedDate),
    [fetchDashboardSummary, selectedDate],
  )

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  if (isLoading || (!summary && !error)) {
    return <LoadingState message='กำลังโหลดข้อมูลรายงาน...' />
  }
  if (error || !summary) {
    return (
      <ErrorState
        message={error || 'ไม่พบข้อมูลรายงาน'}
        onRetry={() => void loadSummary()}
      />
    )
  }

  const kpis = [
    {
      title: 'นัดหมายทั้งหมด',
      value: `${summary.today_appointments} คิว`,
      icon: <EventAvailableOutlinedIcon color='primary' fontSize='large' />,
      bg: 'primary.light',
    },
    {
      title: 'คนไข้ที่ตรวจเสร็จ',
      value: `${summary.patients_visited} ราย`,
      icon: <PeopleAltOutlinedIcon color='primary' fontSize='large' />,
      bg: 'primary.light',
    },
    {
      title: 'ตรวจเสร็จ / รอตรวจ',
      value: `${summary.appointment_statuses.completed} / ${summary.appointment_statuses.waiting}`,
      icon: <CheckCircleOutlineIcon color='success' fontSize='large' />,
      bg: 'success.light',
    },
    {
      title: 'รับชำระในวันที่เลือก',
      value: formatCurrency(summary.revenue.collected_on_date),
      icon: <PaymentsOutlinedIcon color='secondary' fontSize='large' />,
      bg: 'secondary.light',
    },
  ]

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>
            ภาพรวมคลินิกและรายงานประจำวัน
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            ข้อมูลวันที่ {summary.date} (เวลา Asia/Bangkok)
          </Typography>
        </Box>
        <Button
          variant='contained'
          endIcon={<ArrowForwardIcon />}
          onClick={() => router.push('/appointments')}
        >
          จัดการคิวและนัดหมาย
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <LabeledTextField
          label='วันที่รายงาน'
          type='date'
          size='small'
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          sx={{ minWidth: 220 }}
        />
        <Button
          variant={selectedDate === bangkokDate() ? 'contained' : 'outlined'}
          onClick={() => setSelectedDate(bangkokDate())}
        >
          วันนี้
        </Button>
        <Button
          variant={selectedDate === bangkokDate(-1) ? 'contained' : 'outlined'}
          onClick={() => setSelectedDate(bangkokDate(-1))}
        >
          เมื่อวาน
        </Button>
      </Paper>

      {summary.low_stock_meds > 0 && (
        <Alert
          severity='warning'
          icon={<WarningAmberIcon />}
          action={
            <Button color='inherit' size='small' onClick={() => router.push('/medications')}>
              ดูคลังยา
            </Button>
          }
          sx={{ mb: 3 }}
        >
          แจ้งเตือนคลังยา: มียา {summary.low_stock_meds} รายการ
          ที่คงเหลือต่ำกว่าเกณฑ์ขั้นต่ำ
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpis.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {card.title}
                  </Typography>
                  <Typography variant='h5' sx={{ mt: 0.5, fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: card.bg, display: 'flex' }}>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          ['ค่าตรวจ', summary.revenue.consultation_fees],
          ['ยอดค่ายา', summary.revenue.medication_sales],
          ['ยอดเรียกเก็บทั้งหมด', summary.revenue.billed_total],
          ['ชำระแล้ว', summary.revenue.paid_total],
          ['ค้างชำระ', summary.revenue.unpaid_total],
        ].map(([label, amount]) => (
          <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant='body2' color='text.secondary'>{label}</Typography>
                <Typography variant='h6' sx={{ mt: 0.5, fontWeight: 700 }}>
                  {formatCurrency(amount as number)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={`เสร็จสิ้น ${summary.appointment_statuses.completed}`} color='success' />
        <Chip label={`รอตรวจ ${summary.appointment_statuses.waiting}`} color='primary' />
        <Chip label={`ยกเลิก ${summary.appointment_statuses.cancelled}`} color='default' />
        <Chip label={`ค้างชำระ ${formatCurrency(summary.revenue.unpaid_total)}`} color='warning' />
      </Box>

      <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
        รายชื่อผู้ป่วยและการเรียกเก็บเงิน
      </Typography>
      {summary.visits.length === 0 ? (
        <EmptyState title='ไม่มีนัดหมายในวันที่เลือก' description='เลือกวันอื่นเพื่อดูรายงานย้อนหลัง' />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table sx={{ minWidth: 1050 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {['เวลา', 'รหัส HN', 'ชื่อผู้ป่วย', 'แพทย์', 'ผลวินิจฉัย', 'สถานะ', 'เรียกเก็บ', 'ชำระเงิน'].map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 700 }}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.visits.map((visit) => (
                <TableRow key={visit.appointment_id} hover>
                  <TableCell>{visit.appointment_time}</TableCell>
                  <TableCell>{visit.hn_code}</TableCell>
                  <TableCell>{visit.patient_name}</TableCell>
                  <TableCell>{visit.doctor_name}</TableCell>
                  <TableCell>{visit.diagnosis || '-'}</TableCell>
                  <TableCell><AppointmentStatusBadge status={visit.visit_status} /></TableCell>
                  <TableCell>{formatCurrency(visit.billed_amount)}</TableCell>
                  <TableCell>
                    <Chip size='small' label={visit.payment_status} color={visit.payment_status === 'paid' ? 'success' : visit.payment_status === 'unpaid' ? 'warning' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
