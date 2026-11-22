'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useAuthStore } from '@/store/useAuthStore'
import { usePatientStore } from '@/store/usePatientStore'
import { Patient } from '@/types'
import EmptyState from '@/components/common/StateViews/EmptyState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import LoadingState from '@/components/common/StateViews/LoadingState'
import CreatePatientModal from '@/components/patients/CreatePatientModal'
import PatientDetailDrawer from '@/components/patients/PatientDetailDrawer'

export default function PatientsPage() {
  const user = useAuthStore((state) => state.user)
  const patients = usePatientStore((state) => state.patients)
  const isLoading = usePatientStore((state) => state.isLoading)
  const error = usePatientStore((state) => state.error)
  const fetchPatients = usePatientStore((state) => state.fetchPatients)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [activePatientId, setActivePatientId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadPatients = useCallback(() => {
    fetchPatients(debouncedSearch)
  }, [fetchPatients, debouncedSearch])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const activePatient: Patient | null =
    patients.find((p) => p.id === activePatientId) || null

  const canRegisterPatient =
    user?.role === 'receptionist' || user?.role === 'admin'
  const canEditAllergy =
    user?.role === 'doctor' ||
    user?.role === 'admin' ||
    user?.role === 'receptionist'

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
            ทะเบียนประวัติคนไข้ (Patients CRM)
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            ค้นหาเวชระเบียน ลงทะเบียนผู้ป่วยใหม่ และตรวจสอบประวัติการแพ้ยา
          </Typography>
        </Box>

        {canRegisterPatient && (
          <Button
            variant='contained'
            startIcon={<PersonAddAlt1Icon />}
            onClick={() => setOpenCreateModal(true)}
          >
            ลงทะเบียนคนไข้ใหม่
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <TextField
          size='small'
          fullWidth
          placeholder='ค้นหาด้วย รหัส HN, ชื่อ-นามสกุล หรือ เบอร์โทรศัพท์...'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      {/* Content */}
      {isLoading ? (
        <LoadingState message='กำลังโหลดทะเบียนประวัติคนไข้...' />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPatients} />
      ) : patients.length === 0 ? (
        <EmptyState
          title='ไม่พบข้อมูลคนไข้'
          description={
            debouncedSearch
              ? `ไม่พบรายชื่อที่ตรงกับ "${debouncedSearch}"`
              : 'ยังไม่มีรายชื่อคนไข้ในระบบ สามารถกดปุ่มด้านล่างเพื่อลงทะเบียนใหม่'
          }
          action={
            canRegisterPatient && !debouncedSearch ? (
              <Button
                variant='contained'
                startIcon={<PersonAddAlt1Icon />}
                onClick={() => setOpenCreateModal(true)}
              >
                ลงทะเบียนคนไข้ใหม่
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
                <TableCell sx={{ fontWeight: 700 }}>รหัส HN</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ชื่อ - นามสกุล</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>เบอร์โทรศัพท์</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>เพศ / กรุ๊ปเลือด</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ประวัติแพ้ยา</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align='right'>
                  รายละเอียด
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => {
                const allergyCount = patient.allergies?.length || 0
                return (
                  <TableRow key={patient.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {patient.hn_code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {patient.prefix}
                      {patient.full_name}
                    </TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      {patient.gender === 'male' ? 'ชาย' : 'หญิง'} /{' '}
                      {patient.blood_type || '-'}
                    </TableCell>
                    <TableCell>
                      {allergyCount > 0 ? (
                        <Chip
                          icon={<WarningAmberIcon />}
                          label={`แพ้ยา ${allergyCount} รายการ`}
                          color='error'
                          size='small'
                          variant='outlined'
                        />
                      ) : (
                        <Chip
                          label='ไม่พบประวัติแพ้ยา'
                          size='small'
                          variant='outlined'
                        />
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => setActivePatientId(patient.id)}
                      >
                        ดูประวัติ / แพ้ยา
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreatePatientModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />

      <PatientDetailDrawer
        patient={activePatient}
        onClose={() => setActivePatientId(null)}
        canEditAllergy={canEditAllergy}
      />
    </Box>
  )
}
