'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  InputAdornment,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useAuthStore } from '@/store/useAuthStore'
import { useMedicationStore } from '@/store/useMedicationStore'
import DashboardAuthGuard from '@/components/auth/DashboardAuthGuard'
import EmptyState from '@/components/common/StateViews/EmptyState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import LoadingState from '@/components/common/StateViews/LoadingState'
import { CreateMedicationModal } from '@/components/medications/CreateMedicationModal'
import { RestockModal } from '@/components/medications/RestockModal'
import { Medication } from '@/types'
import { LabeledTextField } from '@/components/common/LabeledTextField'

const TABLE_HEADERS = [
  'รหัส',
  'ชื่อยา / ชื่อสามัญ',
  'ประเภท / คำเตือน',
  'หน่วย',
  'ราคาต่อหน่วย',
  'คงเหลือ',
  'สต็อกขั้นต่ำ',
  'จัดการ',
]

export default function MedicationsPage() {
  return (
    <DashboardAuthGuard allowedRoles={['admin', 'doctor', 'receptionist']}>
      <MedicationContent />
    </DashboardAuthGuard>
  )
}
function MedicationContent() {
  const role = useAuthStore((state) => state.user?.role)
  const { medications, isLoading, error, fetchMedications } =
    useMedicationStore()

  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [restock, setRestock] = useState<Medication | null>(null)

  useEffect(() => {
    fetchMedications()
  }, [fetchMedications])

  const filtered = useMemo(
    () =>
      medications.filter((med) => {
        const term = search.trim().toLocaleLowerCase()
        return (
          (!term ||
            med.name.toLocaleLowerCase().includes(term) ||
            (med.generic_name ?? '').toLocaleLowerCase().includes(term)) &&
          (!lowStockOnly || med.stock_quantity <= med.min_stock_alert)
        )
      }),
    [medications, search, lowStockOnly],
  )

  const canCreate = role === 'admin'
  const canRestock = role === 'admin' || role === 'receptionist'
  
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
            คลังยาและเวชภัณฑ์
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            ตรวจสอบคงเหลือ ราคาต่อหน่วย และรายการใกล้หมด
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => { setEditingMedication(null); setCreateOpen(true) }}
          >
            เพิ่มยา
          </Button>
        )}
      </Box>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <LabeledTextField
          label='ค้นหายา'
          size='small'
          placeholder='ค้นหาชื่อยา หรือชื่อสามัญ'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <FormControlLabel
          control={
            <Switch
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
          }
          label='แสดงเฉพาะยาใกล้หมด'
        />
      </Paper>
      {isLoading ? (
        <LoadingState message='กำลังโหลดคลังยา...' />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchMedications()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title='ไม่พบรายการยา'
          description='ลองเปลี่ยนคำค้นหรือเงื่อนไขกรอง'
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
                {TABLE_HEADERS.map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 700 }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((med) => {
                const low = med.stock_quantity <= med.min_stock_alert
                return (
                  <TableRow key={med.id} hover>
                    <TableCell>{med.code}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {med.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {med.generic_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{med.category || '-'}</Typography>
                      {med.allergy_warnings && (
                        <Typography variant='caption' color='error.main'>
                          {med.allergy_warnings}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{med.unit}</TableCell>
                    <TableCell>
                      {med.price_per_unit.toLocaleString()} ฿
                    </TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        label={`${med.stock_quantity} ${med.unit}`}
                        color={low ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{med.min_stock_alert}</TableCell>
                    <TableCell>
                      {canCreate && (
                        <Button
                          size='small'
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => { setEditingMedication(med); setCreateOpen(true) }}
                        >
                          แก้ไข
                        </Button>
                      )}
                      {canRestock && (
                        <Button size='small' onClick={() => setRestock(med)}>
                          เติมสต็อก
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {error && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <CreateMedicationModal
        key={`${createOpen}-${editingMedication?.id ?? 'new'}`}
        open={createOpen}
        medication={editingMedication}
        onClose={() => { setCreateOpen(false); setEditingMedication(null) }}
      />
      <RestockModal medication={restock} onClose={() => setRestock(null)} />
    </Box>
  )
}
