'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useExaminationStore } from '@/store/useExaminationStore'
import { PrescriptionInput } from '@/types'

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HistoryIcon from '@mui/icons-material/History'
import LoadingState from '@/components/common/StateViews/LoadingState'
import ErrorState from '@/components/common/StateViews/ErrorState'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import { PatientAllergyBanner } from '@/components/examination/PatientAllergyBanner'
import {
  detectAllergyConflicts,
  PrescriptionBuilder,
} from '@/components/examination/PrescriptionBuilder'
import { formatStatus } from '@/lib/helper/textFormat'
import DashboardAuthGuard from '@/components/auth/DashboardAuthGuard'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ExaminationPage({ params }: PageProps) {
  return (
    <DashboardAuthGuard allowedRoles={['admin', 'doctor']}>
      <ExaminationContent params={params} />
    </DashboardAuthGuard>
  )
}

function ExaminationContent({ params }: PageProps) {
  const { id: appointmentId } = use(params)
  const router = useRouter()

  const {
    appointment,
    patient,
    medicalHistory,
    medications,
    isLoading,
    isSubmitting,
    error,
    loadExaminationContext,
    submitMedicalRecord,
  } = useExaminationStore()

  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatmentNotes, setTreatmentNotes] = useState('')
  const [prescriptions, setPrescriptions] = useState<PrescriptionInput[]>([])
  const [overrideAllergyWarning, setOverrideAllergyWarning] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    loadExaminationContext(appointmentId)
  }, [appointmentId, loadExaminationContext])

  if (isLoading) {
    return (
      <LoadingState message='กำลังเตรียมข้อมูลห้องตรวจและประวัติการแพ้ยา...' />
    )
  }

  if (error || !appointment || !patient) {
    return (
      <ErrorState
        message={error || 'ไม่พบข้อมูลนัดหมายสำหรับการตรวจ'}
        onRetry={() => loadExaminationContext(appointmentId)}
      />
    )
  }

  const isReadOnly =
    appointment.status === 'completed' ||
    appointment.status === 'cancelled' ||
    appointment.status === 'no_show'

  const allergyConflicts = detectAllergyConflicts(
    prescriptions,
    medications,
    patient.allergies || [],
  )

  const hasStockError = prescriptions.some((item) => {
    const med = medications.find((m) => m.id === item.medication_id)
    return med !== undefined && item.quantity > med.stock_quantity
  })

  const statusLabelHumanReadable = formatStatus(appointment.status)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (allergyConflicts.length > 0 && !overrideAllergyWarning) {
      setSubmitError(
        'กรุณาติ๊กยืนยันการสั่งจ่ายยาที่ตรงกับประวัติการแพ้ยาของคนไข้ก่อนบันทึก',
      )
      return
    }

    if (hasStockError) {
      setSubmitError(
        'มีรายการยาที่สั่งจ่ายเกินจำนวนคงเหลือในคลัง กรุณาตรวจสอบอีกครั้ง',
      )
      return
    }

    try {
      await submitMedicalRecord({
        appointment_id: appointment.id,
        diagnosis: diagnosis.trim(),
        symptoms: symptoms.trim() || undefined,
        treatment_notes: treatmentNotes.trim() || undefined,
        prescriptions,
        override_allergy_warning: overrideAllergyWarning,
      })
      router.push('/appointments')
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกผลตรวจ',
      )
    }
  }

  return (
    <Box>
      {/* Top Bar */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant='outlined'
            size='small'
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/appointments')}
          >
            กลับหน้าคิว
          </Button>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              ห้องตรวจแพทย์ (Examination Room)
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              เวลานัดหมาย: {appointment.appointment_date.split('T')[0]} (
              {appointment.start_time} - {appointment.end_time}) | สาเหตุที่นัด:{' '}
              {appointment.reason || '-'}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`สถานะ: ${statusLabelHumanReadable}`}
          color={appointment.status === 'completed' ? 'success' : 'primary'}
        />
      </Box>

      {/* Patient & Allergy Alert Banner */}
      <PatientAllergyBanner patient={patient} />

      {isReadOnly && (
        <Alert severity='info' sx={{ mb: 3 }}>
          รายการนัดหมายนี้อยู่ในสถานะ <strong>{statusLabelHumanReadable}</strong>{' '}
          ไม่สามารถแก้ไขผลตรวจได้
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left: Examination Form & Prescriptions */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            {submitError && <Alert severity='error'>{submitError}</Alert>}

            <Paper
              elevation={0}
              sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                บันทึกการตรวจและคำวินิจฉัย
              </Typography>
              <Stack spacing={2}>
                <LabeledTextField
                  label='อาการสำคัญ (Symptoms)'
                  multiline
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder='เช่น มีไข้สูง 38.5 องศา เจ็บคอ ไอแห้งมา 2 วัน'
                  disabled={isReadOnly || isSubmitting}
                  fullWidth
                />

                <LabeledTextField
                  label='ผลการวินิจฉัยโรค (Diagnosis)'
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder='เช่น Acute Pharyngitis (คออักเสบเฉียบพลัน)'
                  required
                  disabled={isReadOnly || isSubmitting}
                  fullWidth
                />

                <LabeledTextField
                  label='แผนการรักษา / คำแนะนำเพิ่มเติม (Treatment Notes)'
                  multiline
                  rows={2}
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  placeholder='เช่น พักผ่อนให้เพียงพอ ดื่มน้ำอุ่นมากๆ หากไข้ไม่ลดใน 3 วันให้กลับมาพบแพทย์'
                  disabled={isReadOnly || isSubmitting}
                  fullWidth
                />
              </Stack>
            </Paper>

            <PrescriptionBuilder
              items={prescriptions}
              medications={medications}
              allergies={patient.allergies || []}
              overrideAllergyWarning={overrideAllergyWarning}
              onChangeItems={setPrescriptions}
              onChangeOverride={setOverrideAllergyWarning}
              disabled={isReadOnly || isSubmitting}
            />

            {!isReadOnly && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type='submit'
                  variant='contained'
                  color='success'
                  size='large'
                  startIcon={<CheckCircleIcon />}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'กำลังบันทึกผลตรวจ...'
                    : 'บันทึกผลตรวจและปิดเคส (Complete)'}
                </Button>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Right: Past Medical History */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HistoryIcon color='primary' fontSize='small' />
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                ประวัติการรักษาย้อนหลัง ({medicalHistory.length})
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {medicalHistory.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                ผู้ป่วยยังไม่มีประวัติการรักษาที่เสร็จสิ้นก่อนหน้านี้
              </Typography>
            ) : (
              <Stack spacing={2}>
                {medicalHistory.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='primary'
                      sx={{ fontWeight: 700 }}
                    >
                      {item.appointment_date.split('T')[0]} ({item.start_time})
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 700, mt: 0.5 }}
                    >
                      วินิจฉัย: {item.medical_record?.diagnosis || '-'}
                    </Typography>
                    {item.medical_record?.symptoms && (
                      <Typography
                        variant='caption'
                        sx={{ display: 'block', color: 'text.secondary' }}
                      >
                        อาการ: {item.medical_record.symptoms}
                      </Typography>
                    )}
                    {item.medical_record?.prescriptions &&
                      item.medical_record.prescriptions.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant='caption'
                            sx={{ fontWeight: 700 }}
                          >
                            ยาที่ได้รับ:
                          </Typography>
                          {item.medical_record.prescriptions.map((rx) => (
                            <Typography
                              key={rx.id}
                              variant='caption'
                              sx={{ display: 'block', color: 'text.secondary' }}
                            >
                              • {rx.medication?.name} x {rx.quantity}
                            </Typography>
                          ))}
                        </Box>
                      )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
