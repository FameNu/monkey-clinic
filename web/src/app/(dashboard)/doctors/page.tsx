'use client'

import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/PersonAddAlt1'
import { useAuthStore } from '@/store/useAuthStore'
import { useDoctorStore } from '@/store/useDoctorStore'
import { CreateDoctorModal } from '@/components/doctors/CreateDoctorModal'
import DashboardAuthGuard from '@/components/auth/DashboardAuthGuard'
import EmptyState from '@/components/common/StateViews/EmptyState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import LoadingState from '@/components/common/StateViews/LoadingState'

export default function DoctorsPage() {
  return (
    <DashboardAuthGuard>
      <DoctorsContent />
    </DashboardAuthGuard>
  )
}

function DoctorsContent() {
  const user = useAuthStore((state) => state.user)
  const doctors = useDoctorStore((state) => state.doctors)
  const isLoading = useDoctorStore((state) => state.isLoading)
  const error = useDoctorStore((state) => state.error)
  const fetchDoctors = useDoctorStore((state) => state.fetchDoctors)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    void fetchDoctors()
  }, [fetchDoctors])
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
            จัดการแพทย์
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            รายชื่อแพทย์และข้อมูลสำหรับจัดตารางนัดหมาย
          </Typography>
        </Box>
        {user?.role === 'admin' && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            เพิ่มแพทย์
          </Button>
        )}
      </Box>
      {isLoading ? (
        <LoadingState message='กำลังโหลดรายชื่อแพทย์...' />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void fetchDoctors()} />
      ) : doctors.length === 0 ? (
        <EmptyState
          title='ยังไม่มีรายชื่อแพทย์'
          description='เพิ่มแพทย์เพื่อให้สามารถจองนัดหมายได้'
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {[
                  'ชื่อแพทย์',
                  'สาขา',
                  'เลขใบอนุญาต',
                  'อีเมล / โทรศัพท์',
                  'สถานะ',
                ].map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 700 }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id} hover>
                  <TableCell>
                    {doctor.prefix}
                    {doctor.full_name}
                  </TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.license_number}</TableCell>
                  <TableCell>
                    {doctor.user?.email || doctor.phone || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={doctor.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      color={doctor.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {error && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <CreateDoctorModal open={open} onClose={() => setOpen(false)} />
    </Box>
  )
}
