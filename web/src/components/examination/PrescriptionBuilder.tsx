'use client'

import { Medication, PatientAllergy, PrescriptionInput } from '@/types'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'

interface Props {
  items: PrescriptionInput[]
  medications: Medication[]
  allergies: PatientAllergy[]
  overrideAllergyWarning: boolean
  onChangeItems: (items: PrescriptionInput[]) => void
  onChangeOverride: (checked: boolean) => void
  disabled?: boolean
}

export interface AllergyConflict {
  medicationName: string
  allergyReason: string
  matchType: 'exact' | 'generic'
}

export function detectAllergyConflicts(
  items: PrescriptionInput[],
  medications: Medication[],
  allergies: PatientAllergy[],
): AllergyConflict[] {
  if (allergies.length === 0 || items.length === 0) return []

  const conflicts: AllergyConflict[] = []

  for (const item of items) {
    if (!item.medication_id) continue
    const selectedMed = medications.find((m) => m.id === item.medication_id)
    if (!selectedMed) continue

    const exactMatch = allergies.find((a) => a.medication_id === selectedMed.id)
    if (exactMatch) {
      conflicts.push({
        medicationName: selectedMed.name,
        allergyReason: `${exactMatch.reaction_note} (ระดับ: ${exactMatch.severity})`,
        matchType: 'exact',
      })
      continue
    }

    if (selectedMed.generic_name) {
      const genericMatch = allergies.find(
        (a) =>
          a.medication?.generic_name &&
          a.medication.generic_name.trim().toLowerCase() ===
            selectedMed.generic_name!.trim().toLowerCase(),
      )
      if (genericMatch) {
        conflicts.push({
          medicationName: `${selectedMed.name} [ตัวยาสามัญ: ${selectedMed.generic_name}]`,
          allergyReason: `แพ้ตัวยากลุ่มเดียวกัน (${genericMatch.medication?.name}) - ${genericMatch.reaction_note}`,
          matchType: 'generic',
        })
      }
    }
  }

  return conflicts
}

export function PrescriptionBuilder({
  items,
  medications,
  allergies,
  overrideAllergyWarning,
  onChangeItems,
  onChangeOverride,
  disabled = false,
}: Props) {
  const conflicts = detectAllergyConflicts(items, medications, allergies)

  const handleAddRow = () => {
    onChangeItems([
      ...items,
      {
        medication_id: '',
        quantity: 1,
        dosage_instruction: 'รับประทานครั้งละ 1 เม็ด หลังอาหาร เช้า-เย็น',
      },
    ])
  }

  const handleRemoveRow = (index: number) => {
    const next = items.filter((_, i) => i !== index)
    onChangeItems(next)
    if (detectAllergyConflicts(next, medications, allergies).length === 0) {
      onChangeOverride(false)
    }
  }

  const handleUpdateRow = <K extends keyof PrescriptionInput>(
    index: number,
    field: K,
    value: PrescriptionInput[K],
  ) => {
    const next = items.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    )
    onChangeItems(next)
    if (detectAllergyConflicts(next, medications, allergies).length === 0) {
      onChangeOverride(false)
    }
  }

  const totalCost = items.reduce((sum, item) => {
    const med = medications.find((m) => m.id === item.medication_id)
    return sum + (med ? med.price_per_unit * item.quantity : 0)
  }, 0)

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
          รายการสั่งจ่ายยา (Prescriptions)
        </Typography>
        <Button
          size='small'
          variant='outlined'
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          disabled={disabled}
        >
          เพิ่มรายการยา
        </Button>
      </Box>

      {conflicts.length > 0 && (
        <Alert
          severity='error'
          sx={{ mb: 2.5, border: '1px solid', borderColor: 'error.main' }}
        >
          <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.5 }}>
            ตรวจพบการสั่งจ่ายยาที่ตรงกับประวัติการแพ้ยาของผู้ป่วย!
          </Typography>
          {conflicts.map((c, idx) => (
            <Typography key={idx} variant='body2'>
              • <strong>{c.medicationName}</strong>: {c.allergyReason}
            </Typography>
          ))}
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                color='error'
                checked={overrideAllergyWarning}
                onChange={(e) => onChangeOverride(e.target.checked)}
                disabled={disabled}
              />
            }
            label={
              <Typography
                variant='body2'
                sx={{ fontWeight: 700, color: 'error.dark' }}
              >
                ยืนยันในฐานะแพทย์ผู้ตรวจว่าได้ประเมินความเสี่ยงแล้ว
                และต้องการสั่งจ่ายยานี้ (Override Allergy Warning)
              </Typography>
            }
          />
        </Alert>
      )}

      {items.length === 0 ? (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ py: 2, textAlign: 'center' }}
        >
          ยังไม่มีรายการสั่งจ่ายยา (กดปุ่ม &quot;เพิ่มรายการยา&quot;
          ด้านบนหากต้องการสั่งยา)
        </Typography>
      ) : (
        <Stack spacing={2}>
          {items.map((item, index) => {
            const selectedMed = medications.find(
              (m) => m.id === item.medication_id,
            )
            const isOutOfStock =
              selectedMed !== undefined &&
              item.quantity > selectedMed.stock_quantity

            return (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: isOutOfStock ? 'error.main' : 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <LabeledTextField
                    select
                    label='เลือกตัวยา'
                    size='small'
                    value={item.medication_id}
                    onChange={(e) =>
                      handleUpdateRow(index, 'medication_id', e.target.value)
                    }
                    required
                    disabled={disabled}
                    sx={{ flex: 2, minWidth: 240 }}
                  >
                    {medications.map((med) => (
                      <MenuItem
                        key={med.id}
                        value={med.id}
                        disabled={med.stock_quantity <= 0}
                      >
                        {med.name} ({med.generic_name}) — คงเหลือ{' '}
                        {med.stock_quantity} {med.unit} (฿
                        {med.price_per_unit})
                      </MenuItem>
                    ))}
                  </LabeledTextField>

                  <LabeledTextField
                    label='จำนวน'
                    type='number'
                    size='small'
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateRow(
                        index,
                        'quantity',
                        Math.max(1, Number(e.target.value)),
                      )
                    }
                    slotProps={{ htmlInput: { min: 1 } }}
                    error={isOutOfStock}
                    helperText={
                      isOutOfStock
                        ? `สต็อกไม่พอ (มี ${selectedMed?.stock_quantity})`
                        : undefined
                    }
                    required
                    disabled={disabled}
                    sx={{ width: 120 }}
                  />

                  <IconButton
                    color='error'
                    onClick={() => handleRemoveRow(index)}
                    disabled={disabled}
                    aria-label='ลบรายการยา'
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>

                {selectedMed?.allergy_warnings && (
                  <Alert severity='warning' sx={{ mt: 1 }}>
                    {selectedMed.allergy_warnings}
                  </Alert>
                )}

                <LabeledTextField
                  label='วิธีรับประทาน / คำแนะนำการใช้ยา'
                  size='small'
                  value={item.dosage_instruction}
                  onChange={(e) =>
                    handleUpdateRow(index, 'dosage_instruction', e.target.value)
                  }
                  required
                  disabled={disabled}
                  fullWidth
                />
              </Box>
            )
          })}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
              ประมาณการค่ายารวม: ฿
              {totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Stack>
      )}
    </Paper>
  )
}
