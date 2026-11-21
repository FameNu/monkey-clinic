'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/store/useAuthStore'
import { useAppointmentStore } from '@/store/useAppointmentStore'
import { AppointmentStatus, AppointmentStatusFilter } from '@/types'

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { AppointmentStatusBadge } from '@/components/common/StatusBadge/AppointmentStatusBadge'
import EmptyState from '@/components/common/StateViews/EmptyState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import LoadingState from '@/components/common/StateViews/LoadingState'
import { CreateAppointmentModal } from '@/components/appointments/CreateAppointmentModal'

const getTodayLocalString = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export default function AppointmentsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const appointments = useAppointmentStore((state) => state.appointments)
  const isLoading = useAppointmentStore((state) => state.isLoading)
  const error = useAppointmentStore((state) => state.error)
  const fetchAppointments = useAppointmentStore(
    (state) => state.fetchAppointments,
  )
  const updateAppointmentStatus = useAppointmentStore(
    (state) => state.updateAppointmentStatus,
  )

  const [selectedDate, setSelectedDate] = useState(getTodayLocalString)
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)

  const loadAppointments = useCallback(() => {
    fetchAppointments({ date: selectedDate, status: statusFilter })
  }, [fetchAppointments, selectedDate, statusFilter])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleUpdateStatus = async (
    id: string,
    newStatus: AppointmentStatus,
  ) => {
    setActionError(null)
    try {
      await updateAppointmentStatus(id, newStatus)
      if (statusFilter !== '') {
        loadAppointments()
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ',
      )
    }
  }

  const handleEnterExamination = async (
    id: string,
    currentStatus: AppointmentStatus,
  ) => {
    setActionError(null)
    try {
      if (currentStatus === 'checked_in') {
        await updateAppointmentStatus(id, 'in_progress')
      }
      router.push(`/examination/${id}`)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'ไม่สามารถเข้าห้องตรวจได้',
      )
    }
  }

  const canExamine = user?.role === 'doctor' || user?.role === 'admin'
  const canManageQueue = user?.role === 'receptionist' || user?.role === 'admin'

  return (
    <Box>
      {/* Header */}
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
            คิวตรวจและตารางนัดหมาย
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            จัดการลำดับคิว เช็กอินคนไข้ และส่งเข้าห้องตรวจแพทย์
          </Typography>
        </Box>

        {canManageQueue && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
          >
            จองนัดหมายใหม่
          </Button>
        )}
      </Box>

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label='วันที่นัดหมาย'
            type='date'
            size='small'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            label='สถานะคิว'
            size='small'
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AppointmentStatusFilter)
            }
            sx={{ minWidth: 200 }}
          >
            <MenuItem value=''>ทั้งหมด</MenuItem>
            <MenuItem value='scheduled'>นัดหมายแล้ว</MenuItem>
            <MenuItem value='checked_in'>เช็กอินแล้ว</MenuItem>
            <MenuItem value='in_progress'>กำลังตรวจ</MenuItem>
            <MenuItem value='completed'>ตรวจเสร็จสิ้น</MenuItem>
            <MenuItem value='cancelled'>ยกเลิก</MenuItem>
            <MenuItem value='no_show'>ไม่มาตามนัด</MenuItem>
          </TextField>
          {selectedDate && (
            <Button
              size='small'
              color='inherit'
              onClick={() => setSelectedDate('')}
            >
              แสดงทุกวัน
            </Button>
          )}
        </Stack>
      </Paper>

      {actionError && (
        <Alert
          severity='error'
          onClose={() => setActionError(null)}
          sx={{ mb: 2 }}
        >
          {actionError}
        </Alert>
      )}

      {/* Table Content */}
      {isLoading ? (
        <LoadingState message='กำลังโหลดตารางนัดหมาย...' />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAppointments} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title='ไม่พบรายการนัดหมาย'
          description='ไม่มีคิวตรวจตามเงื่อนไขวันที่หรือสถานะที่เลือก'
          action={
            canManageQueue ? (
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateModal(true)}
              >
                สร้างนัดหมายใหม่
              </Button>
            ) : undefined
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
                <TableCell sx={{ fontWeight: 700 }}>วันที่ / เวลา</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>คนไข้ (HN)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>แพทย์ผู้ตรวจ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>อาการเบื้องต้น</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align='right'>
                  การจัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt.id} hover>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {appt.appointment_date}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {appt.start_time} - {appt.end_time}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {appt.patient
                        ? `${appt.patient.prefix}${appt.patient.full_name}`
                        : '-'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {appt.patient?.hn_code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {appt.doctor
                      ? `${appt.doctor.prefix}${appt.doctor.full_name}`
                      : '-'}
                  </TableCell>
                  <TableCell>{appt.reason || '-'}</TableCell>
                  <TableCell>
                    <AppointmentStatusBadge status={appt.status} />
                  </TableCell>
                  <TableCell align='right'>
                    <Stack
                      direction='row'
                      sx={{
                        spacing: 1,
                        justifyContent: 'flex-end',
                      }}
                    >
                      {canManageQueue && appt.status === 'scheduled' && (
                        <Button
                          size='small'
                          variant='outlined'
                          color='warning'
                          startIcon={<HowToRegIcon />}
                          onClick={() =>
                            handleUpdateStatus(appt.id, 'checked_in')
                          }
                        >
                          เช็กอิน
                        </Button>
                      )}

                      {canExamine &&
                        (appt.status === 'checked_in' ||
                          appt.status === 'in_progress') && (
                          <Button
                            size='small'
                            variant='contained'
                            color='primary'
                            startIcon={<MedicalServicesOutlinedIcon />}
                            onClick={() =>
                              handleEnterExamination(appt.id, appt.status)
                            }
                          >
                            เข้าห้องตรวจ
                          </Button>
                        )}

                      {canManageQueue &&
                        (appt.status === 'scheduled' ||
                          appt.status === 'checked_in') && (
                          <Button
                            size='small'
                            color='error'
                            startIcon={<CancelOutlinedIcon />}
                            onClick={() =>
                              handleUpdateStatus(appt.id, 'cancelled')
                            }
                          >
                            ยกเลิก
                          </Button>
                        )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateAppointmentModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={loadAppointments}
        defaultDate={selectedDate || undefined}
      />
    </Box>
  )
}
