'use client'

import { FormEvent, useState } from 'react'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch } from '@mui/material'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import { CreateDoctorRequest } from '@/types'
import { useDoctorStore } from '@/store/useDoctorStore'

interface Props { open: boolean; onClose: () => void }

export function CreateDoctorModal({ open, onClose }: Props) {
  const createDoctor = useDoctorStore((state) => state.createDoctor)
  const isSubmitting = useDoctorStore((state) => state.isSubmitting)
  const [payload, setPayload] = useState<CreateDoctorRequest>({
    create_account: false, prefix: 'นพ.', full_name: '', specialization: '',
    license_number: '', phone: '', consultation_fee: 500, email: '', password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const update = <K extends keyof CreateDoctorRequest>(key: K, value: CreateDoctorRequest[K]) => setPayload((current) => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null)
    try { await createDoctor(payload); setPayload({ create_account: false, prefix: 'นพ.', full_name: '', specialization: '', license_number: '', phone: '', consultation_fee: 500, email: '', password: '' }); onClose() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'เพิ่มแพทย์ไม่สำเร็จ') }
  }
  return <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
    <form onSubmit={submit}><DialogTitle>เพิ่มแพทย์</DialogTitle><DialogContent dividers>
      {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gap: 2, pt: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <LabeledTextField label='คำนำหน้า' value={payload.prefix} onChange={(e) => update('prefix', e.target.value)} required />
        <LabeledTextField label='ชื่อ - นามสกุล' value={payload.full_name} onChange={(e) => update('full_name', e.target.value)} required />
        <LabeledTextField label='สาขาเฉพาะทาง' value={payload.specialization} onChange={(e) => update('specialization', e.target.value)} required />
        <LabeledTextField label='เลขใบอนุญาต' value={payload.license_number} onChange={(e) => update('license_number', e.target.value)} required />
        <LabeledTextField label='โทรศัพท์' value={payload.phone} onChange={(e) => update('phone', e.target.value)} />
        <LabeledTextField label='ค่าตรวจ (บาท)' type='number' slotProps={{ htmlInput: { min: 0, step: '0.01' } }} value={payload.consultation_fee} onChange={(e) => update('consultation_fee', Number(e.target.value))} required />
        <FormControlLabel control={<Switch checked={payload.create_account} onChange={(e) => update('create_account', e.target.checked)} />} label='สร้างบัญชีเข้าสู่ระบบ' />
        {payload.create_account && <><LabeledTextField label='อีเมล' type='email' value={payload.email} onChange={(e) => update('email', e.target.value)} required /><LabeledTextField label='รหัสผ่าน' type='password' value={payload.password} onChange={(e) => update('password', e.target.value)} required slotProps={{ htmlInput: { minLength: 6 } }} /></>}
      </Box>
    </DialogContent><DialogActions><Button onClick={onClose} disabled={isSubmitting}>ยกเลิก</Button><Button type='submit' variant='contained' disabled={isSubmitting}>{isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มแพทย์'}</Button></DialogActions></form>
  </Dialog>
}
