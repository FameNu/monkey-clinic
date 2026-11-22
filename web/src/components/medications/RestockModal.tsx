'use client'

import { FormEvent, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { Medication } from '@/types'
import { useMedicationStore } from '@/store/useMedicationStore'

interface Props {
  medication: Medication | null
  onClose: () => void
}
export function RestockModal({ medication, onClose }: Props) {
  const updateStock = useMedicationStore((state) => state.updateStock)
  const isSubmitting = useMedicationStore((state) => state.isSubmitting)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!medication) return
    setError(null)
    try {
      await updateStock(medication.id, quantity)
      setQuantity(1)
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'ปรับสต็อกไม่สำเร็จ')
    }
  }
  return (
    <Dialog
      open={Boolean(medication)}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
    >
      <form onSubmit={submit}>
        <DialogTitle>เติมสต็อกยา</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            autoFocus
            label={`จำนวนที่เติม${medication ? ` (${medication.unit})` : ''}`}
            type='number'
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isSubmitting || quantity < 1}
          >
            บันทึก
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
