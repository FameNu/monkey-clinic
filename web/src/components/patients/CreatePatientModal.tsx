'use client'

import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from '@mui/material'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import { usePatientStore } from '@/store/usePatientStore'
import { BLOOD_TYPES, PREFIX_OPTIONS } from '@/common/selectionList'

interface Props {
  open: boolean
  onClose: () => void
}

// const PREFIX_OPTIONS = ['นาย', 'นาง', 'นางสาว', 'ด.ช.', 'ด.ญ.']
// const BLOOD_TYPES = ['A', 'B', 'AB', 'O'] as const

export default function CreatePatientModal({ open, onClose }: Props) {
  const { createPatient, isSubmitting } = usePatientStore()

  const [prefix, setPrefix] = useState('นาย')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [bloodType, setBloodType] = useState<'A' | 'B' | 'AB' | 'O' | ''>('')
  const [chronicDiseases, setChronicDiseases] = useState('')
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setPrefix('นาย')
    setFullName('')
    setPhone('')
    setDateOfBirth('')
    setGender('male')
    setBloodType('')
    setChronicDiseases('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await createPatient({
        prefix,
        full_name: fullName.trim(),
        phone: phone.trim(),
        date_of_birth: dateOfBirth || undefined,
        gender,
        blood_type: bloodType || undefined,
        chronic_diseases: chronicDiseases.trim() || undefined,
      })
      handleClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงทะเบียน',
      )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      slotProps={{
        transition: {
          onEnter: () => {
            setError(null)
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>ลงทะเบียนคนไข้ใหม่</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <LabeledTextField
                select
                label='คำนำหน้า'
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                required
                sx={{ minWidth: 130 }}
              >
                {PREFIX_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </LabeledTextField>

              <LabeledTextField
                label='ชื่อ - นามสกุล'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                fullWidth
              />
            </Box>

            <LabeledTextField
              select
              label='เพศ'
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              required
              sx={{ minWidth: 140 }}
            >
              <MenuItem value='male'>ชาย</MenuItem>
              <MenuItem value='female'>หญิง</MenuItem>
            </LabeledTextField>

            <LabeledTextField
              label='เบอร์โทรศัพท์'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
            />

            <LabeledTextField
              select
              label='กรุ๊ปเลือด'
              value={bloodType}
              onChange={(e) =>
                setBloodType(e.target.value as 'A' | 'B' | 'AB' | 'O' | '')
              }
              sx={{ minWidth: 140 }}
            >

            <LabeledTextField
              label='วันเดือนปีเกิด'
              type='date'
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              fullWidth
            />
              <MenuItem value=''>ไม่ระบุ</MenuItem>
              {BLOOD_TYPES.map((bg) => (
                <MenuItem key={bg} value={bg}>
                  {bg}
                </MenuItem>
              ))}
            </LabeledTextField>

            <LabeledTextField
              label='โรคประจำตัว (ถ้ามี)'
              value={chronicDiseases}
              onChange={(e) => setChronicDiseases(e.target.value)}
              multiline
              rows={2}
              placeholder='เช่น ความดันโลหิตสูง, เบาหวาน'
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color='inherit' disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกทะเบียนคนไข้'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
