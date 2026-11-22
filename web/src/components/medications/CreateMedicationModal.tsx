'use client'

import { FormEvent, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import { CreateMedicationRequest, Medication } from '@/types'
import { useMedicationStore } from '@/store/useMedicationStore'

interface Props {
  open: boolean
  onClose: () => void
  medication?: Medication | null
}
const initial: CreateMedicationRequest = {
  code: '',
  name: '',
  generic_name: '',
  category: '',
  allergy_warnings: '',
  unit: 'เม็ด',
  price_per_unit: 0,
  stock_quantity: 0,
  min_stock_alert: 10,
  note: '',
}

export function CreateMedicationModal({
  open,
  onClose,
  medication = null,
}: Props) {
  const { createMedication, updateMedication, isSubmitting } =
    useMedicationStore()

  const [payload, setPayload] = useState<CreateMedicationRequest>(() =>
    medication
      ? {
          code: medication.code,
          name: medication.name,
          generic_name: medication.generic_name ?? '',
          category: medication.category ?? '',
          allergy_warnings: medication.allergy_warnings ?? '',
          unit: medication.unit,
          price_per_unit: medication.price_per_unit,
          stock_quantity: medication.stock_quantity,
          min_stock_alert: medication.min_stock_alert,
          note: medication.note ?? '',
        }
      : initial,
  )
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      if (medication) {
        await updateMedication(medication.id, payload)
      } else {
        await createMedication(payload)
      }
      setPayload(initial)
      onClose()
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'บันทึกข้อมูลยาไม่สำเร็จ',
      )
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>
          {medication ? 'แก้ไขรายการยา' : 'เพิ่มรายการยา'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={1.5}>
            <LabeledTextField
              label='รหัสยา'
              value={payload.code}
              onChange={(e) => setPayload({ ...payload, code: e.target.value })}
              required
            />
            <LabeledTextField
              label='ชื่อยา'
              value={payload.name}
              onChange={(e) => setPayload({ ...payload, name: e.target.value })}
              required
            />
            <LabeledTextField
              label='ชื่อสามัญ'
              value={payload.generic_name}
              onChange={(e) =>
                setPayload({ ...payload, generic_name: e.target.value })
              }
              required
            />
            <LabeledTextField
              label='ชนิดยา / หมวดหมู่'
              value={payload.category}
              onChange={(e) =>
                setPayload({ ...payload, category: e.target.value })
              }
            />
            <LabeledTextField
              label='คำเตือนการแพ้ยา'
              value={payload.allergy_warnings}
              onChange={(e) =>
                setPayload({ ...payload, allergy_warnings: e.target.value })
              }
              multiline
              rows={2}
            />
            <LabeledTextField
              label='หน่วย'
              value={payload.unit}
              onChange={(e) => setPayload({ ...payload, unit: e.target.value })}
              required
            />
            <LabeledTextField
              label='ราคาต่อหน่วย (บาท)'
              type='number'
              slotProps={{ htmlInput: { min: 0.01, step: '0.01' } }}
              value={payload.price_per_unit}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  price_per_unit: Number(e.target.value),
                })
              }
              required
            />
            <LabeledTextField
              label='จำนวนเริ่มต้น'
              type='number'
              slotProps={{ htmlInput: { min: 0 } }}
              value={payload.stock_quantity}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  stock_quantity: Number(e.target.value),
                })
              }
              required
            />
            <LabeledTextField
              label='แจ้งเตือนเมื่อเหลือ'
              type='number'
              slotProps={{ htmlInput: { min: 0 } }}
              value={payload.min_stock_alert}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  min_stock_alert: Number(e.target.value),
                })
              }
              required
            />
            <LabeledTextField
              label='หมายเหตุ'
              value={payload.note}
              onChange={(e) => setPayload({ ...payload, note: e.target.value })}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting
              ? 'กำลังบันทึก...'
              : medication
                ? 'บันทึกการแก้ไข'
                : 'เพิ่มยา'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
