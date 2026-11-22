'use client'

import { FormEvent, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem } from '@mui/material'
import { LabeledTextField } from '@/components/common/LabeledTextField'
import { Invoice, PaymentMethod } from '@/types'
import { useInvoiceStore } from '@/store/useInvoiceStore'

interface Props { invoice: Invoice | null; onClose: () => void }
export function PaymentModal({ invoice, onClose }: Props) {
  const markInvoiceAsPaid = useInvoiceStore((state) => state.markInvoiceAsPaid)
  const isSubmitting = useInvoiceStore((state) => state.isSubmitting)
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!invoice) return; setError(null); try { await markInvoiceAsPaid(invoice.id, { payment_method: method }); setMethod('cash'); onClose() } catch (reason) { setError(reason instanceof Error ? reason.message : 'บันทึกการชำระเงินไม่สำเร็จ') } }
  return <Dialog open={Boolean(invoice)} onClose={onClose} maxWidth='xs' fullWidth><form onSubmit={submit}><DialogTitle>รับชำระเงิน</DialogTitle><DialogContent dividers>{error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}<LabeledTextField select fullWidth label='วิธีชำระเงิน' value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} sx={{ mt: 1 }}>{[['cash', 'เงินสด'], ['promptpay', 'โอน / QR PromptPay'], ['credit_card', 'บัตรเครดิต']].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</LabeledTextField></DialogContent><DialogActions><Button onClick={onClose} disabled={isSubmitting}>ยกเลิก</Button><Button type='submit' variant='contained' disabled={isSubmitting}>ยืนยันรับชำระ</Button></DialogActions></form></Dialog>
}
