'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAppointmentStore } from '@/store/useAppointmentStore'
import { useDashboardStore } from '@/store/useDashboardStore'
import DashboardAuthGuard from '@/components/auth/DashboardAuthGuard'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { AppointmentStatusBadge } from '@/components/common/StatusBadge/AppointmentStatusBadge'
import EmptyState from '@/components/common/StateViews/EmptyState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import LoadingState from '@/components/common/StateViews/LoadingState'

export default function DashboardPage() {
  return (
    <DashboardAuthGuard>
      <DashboardContent />
    </DashboardAuthGuard>
  )
}

function DashboardContent() {
  const router = useRouter()
  const {
    summary,
    isLoading: summaryLoading,
    error: summaryError,
    fetchDashboardSummary,
  } = useDashboardStore()
  const {
    appointments: todayQueue,
    isLoading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointmentsByDate,
  } = useAppointmentStore()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const fetchDashboardData = useCallback(async () => {
    await Promise.allSettled([
      fetchDashboardSummary(),
      fetchAppointmentsByDate(todayStr),
    ])
  }, [fetchAppointmentsByDate, fetchDashboardSummary, todayStr])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (
    summaryLoading ||
    appointmentsLoading ||
    (!summary && !summaryError && !appointmentsError)
  ) {
    return <LoadingState message='กำลังโหลดข้อมูลภาพรวมคลินิก...' />
  }
  if (summaryError || appointmentsError || !summary)
    return (
      <ErrorState
        message={summaryError || appointmentsError || 'ไม่พบข้อมูล'}
        onRetry={fetchDashboardData}
      />
    )

  const kpiCards = [
    {
      title: 'นัดหมายวันนี้',
      value: `${summary.today_appointments} คิว`,
      icon: <EventAvailableOutlinedIcon color='primary' fontSize='large' />,
      bg: '#e0f2fe',
    },
    {
      title: 'ตรวจเสร็จสิ้นวันนี้',
      value: `${summary.completed_today} คิว`,
      icon: <CheckCircleOutlineIcon color='success' fontSize='large' />,
      bg: '#dcfce7',
    },
    {
      title: 'คนไข้ในระบบทั้งหมด',
      value: `${summary.total_patients.toLocaleString()} ราย`,
      icon: <PeopleAltOutlinedIcon color='secondary' fontSize='large' />,
      bg: '#ccfbf1',
    },
    {
      title: 'รายได้วันนี้',
      value: `฿${summary.today_revenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
      icon: <PaymentsOutlinedIcon sx={{ color: '#d97706' }} fontSize='large' />,
      bg: '#fef3c7',
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
            ภาพรวมคลินิก (Dashboard)
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            ข้อมูลประจำวันที่ {summary.date}
          </Typography>
        </Box>
        <Button
          variant='contained'
          endIcon={<ArrowForwardIcon />}
          onClick={() => router.push('/appointments')}
        >
          จัดการคิวและนัดหมายทั้งหมด
        </Button>
      </Box>

      {summary.low_stock_meds > 0 && (
        <Alert
          severity='warning'
          icon={<WarningAmberIcon />}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => router.push('/medications')}
            >
              ดูคลังยา
            </Button>
          }
          sx={{ mb: 3 }}
        >
          แจ้งเตือนคลังยา: มียาจำนวน{' '}
          <strong>{summary.low_stock_meds} รายการ</strong>{' '}
          ที่คงเหลือต่ำกว่าเกณฑ์ขั้นต่ำ
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpiCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ fontWeight: 500 }}
                  >
                    {card.title}
                  </Typography>
                  <Typography variant='h5' sx={{ mt: 0.5, fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: card.bg,
                    display: 'flex',
                  }}
                >
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Today's Queue Table */}
      <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
        รายการนัดหมายประจำวันนี้
      </Typography>

      {todayQueue.length === 0 ? (
        <EmptyState
          title='ยังไม่มีรายการนัดหมายวันนี้'
          description='สามารถกดปุ่มด้านล่างเพื่อเพิ่มนัดหมายใหม่ได้ทันที'
          action={
            <Button
              variant='outlined'
              onClick={() => router.push('/appointments')}
            >
              ไปหน้าตารางนัดหมาย
            </Button>
          }
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>เวลา</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>รหัส HN</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ชื่อคนไข้</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>แพทย์ผู้ตรวจ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>อาการเบื้องต้น</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>สถานะ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todayQueue.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {item.start_time} - {item.end_time}
                  </TableCell>
                  <TableCell>{item.patient?.hn_code || '-'}</TableCell>
                  <TableCell>
                    {item.patient
                      ? `${item.patient.prefix}${item.patient.full_name}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.doctor
                      ? `${item.doctor.prefix}${item.doctor.full_name}`
                      : '-'}
                  </TableCell>
                  <TableCell>{item.reason || '-'}</TableCell>
                  <TableCell>
                    <AppointmentStatusBadge status={item.status} />
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
