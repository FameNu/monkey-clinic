'use client'

import { SyntheticEvent, useEffect, useMemo, useState } from 'react'

import { StaffPayload, StaffRecord, UserRole } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'
import { useStaffStore } from '@/store/useStaffStore'

import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/PersonAddAlt1'
import SearchIcon from '@mui/icons-material/Search'
import DashboardAuthGuard from '@/components/auth/DashboardAuthGuard'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import EmptyState from '@/components/common/StateViews/EmptyState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import LoadingState from '@/components/common/StateViews/LoadingState'
import { StaffDialog } from '@/components/staff/StaffDialog'

type RoleFilter = 'all' | UserRole
type ActiveFilter = 'all' | 'true' | 'false'

const roleLabels: Record<UserRole, string> = {
  admin: 'ผู้ดูแลระบบ',
  receptionist: 'เจ้าหน้าที่',
  doctor: 'แพทย์',
}

const HEADERS_TABLE = [
  'ชื่อ - นามสกุล',
  'อีเมล / โทรศัพท์',
  'บทบาท',
  'ข้อมูลแพทย์',
  'สถานะใช้งาน',
  'แก้ไข',
]

export default function StaffPage() {
  return (
    <DashboardAuthGuard allowedRoles={['admin']}>
      <StaffContent />
    </DashboardAuthGuard>
  )
}

function StaffContent() {
  // const currentUser = useAuthStore((state) => state.user)
  // const { staff, isLoading, error, fetchStaff, updateStaff } = useStaffStore()
  const { user: currentUser } = useAuthStore()
  const { staff, isLoading, error, fetchStaff, updateStaff } = useStaffStore()

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null)

  useEffect(() => {
    void fetchStaff({
      role: roleFilter === 'all' ? undefined : roleFilter,
      active: activeFilter === 'all' ? undefined : activeFilter === 'true',
    })
  }, [activeFilter, fetchStaff, roleFilter])

  const filteredStaff = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return staff
    return staff.filter((person) =>
      `${person.full_name} ${person.email} ${person.phone ?? ''}`
        .toLocaleLowerCase()
        .includes(term),
    )
  }, [search, staff])

  const openCreate = () => {
    setSelectedStaff(null)
    setDialogOpen(true)
  }

  const toggleActive = async (person: StaffRecord, active: boolean) => {
    const payload: StaffPayload = {
      email: person.email,
      prefix: person.prefix,
      full_name: person.full_name,
      phone: person.phone ?? '',
      role: person.role,
      is_active: active,
      specialization: person.doctor?.specialization ?? '',
      license_number: person.doctor?.license_number ?? '',
      consultation_fee: person.doctor?.consultation_fee ?? 500,
      doctor_notes: person.doctor?.notes ?? '',
      schedules: person.doctor?.schedules ?? [],
    }
    try {
      await updateStaff(person.id, payload)
      await fetchStaff({
        role: roleFilter === 'all' ? undefined : roleFilter,
        active: activeFilter === 'all' ? undefined : activeFilter === 'true',
      })
    } catch {
      // The store reports the error in the table state.
    }
  }

  const handleRoleChange = (_event: SyntheticEvent, value: RoleFilter) => {
    setRoleFilter(value)
  }

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
            จัดการบุคลากร
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            บัญชีผู้ใช้ แพทย์ และสถานะการเข้าใช้งาน
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          เพิ่มบุคลากร
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Tabs
          value={roleFilter}
          onChange={handleRoleChange}
          variant='scrollable'
          scrollButtons='auto'
        >
          <Tab value='all' label='ทั้งหมด' />
          <Tab value='doctor' label='แพทย์' />
          <Tab value='receptionist' label='เจ้าหน้าที่' />
          <Tab value='admin' label='ผู้ดูแลระบบ' />
        </Tabs>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <LabeledTextField
          label='ค้นหาบุคลากร'
          size='small'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='ค้นหาชื่อ อีเมล หรือโทรศัพท์'
          sx={{ flex: 1, minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <LabeledTextField
          select
          label='สถานะบัญชี'
          size='small'
          value={activeFilter}
          onChange={(event) =>
            setActiveFilter(event.target.value as ActiveFilter)
          }
          sx={{ minWidth: 190 }}
        >
          <MenuItem value='all'>ทุกสถานะ</MenuItem>
          <MenuItem value='true'>ใช้งาน</MenuItem>
          <MenuItem value='false'>ปิดใช้งาน</MenuItem>
        </LabeledTextField>
      </Paper>

      {isLoading ? (
        <LoadingState message='กำลังโหลดรายชื่อบุคลากร...' />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() =>
            void fetchStaff({
              role: roleFilter === 'all' ? undefined : roleFilter,
              active:
                activeFilter === 'all' ? undefined : activeFilter === 'true',
            })
          }
        />
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          title='ไม่พบบุคลากร'
          description='ปรับตัวกรองหรือเพิ่มบัญชีบุคลากรใหม่'
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <Table sx={{ minWidth: 850 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {HEADERS_TABLE.map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 700 }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((person) => (
                <TableRow key={person.id} hover>
                  <TableCell>
                    {person.prefix}
                    {person.full_name}
                  </TableCell>
                  <TableCell>
                    {person.email}
                    <br />
                    <Typography variant='caption' color='text.secondary'>
                      {person.phone || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{roleLabels[person.role]}</TableCell>
                  <TableCell>
                    {person.doctor
                      ? `${person.doctor.specialization} · ${person.doctor.license_number}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={person.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      color={person.is_active ? 'success' : 'default'}
                    />
                    <Switch
                      checked={person.is_active}
                      disabled={person.id === currentUser?.id}
                      onChange={(event) =>
                        void toggleActive(person, event.target.checked)
                      }
                      slotProps={{
                        input: {
                          'aria-label': `เปลี่ยนสถานะ ${person.full_name}`,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size='small'
                      onClick={() => {
                        setSelectedStaff(person)
                        setDialogOpen(true)
                      }}
                    >
                      แก้ไข
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <StaffDialog
        key={`${dialogOpen}-${selectedStaff?.id ?? 'new'}`}
        open={dialogOpen}
        staff={selectedStaff}
        isSelf={selectedStaff?.id === currentUser?.id}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  )
}
