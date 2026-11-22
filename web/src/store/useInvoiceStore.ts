import { create } from 'zustand'
import { CreateInvoiceRequest, Invoice, PayInvoiceRequest } from '@/types'
import { invoiceApi } from '@/lib/api/invoice-api'
import { ApiError, getErrorMessage } from '@/lib/axios-instance'

type InvoiceState = {
  invoices: Invoice[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fetchInvoices: () => Promise<void>
  createInvoice: (payload: CreateInvoiceRequest) => Promise<void>
  markInvoiceAsPaid: (id: string, payload: PayInvoiceRequest) => Promise<void>
}

const api = invoiceApi()

export const useInvoiceStore = create<InvoiceState>()((set) => ({
  invoices: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  fetchInvoices: async () => {
    set({ isLoading: true, error: null })
    try {
      set({ invoices: await api.getInvoices(), isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, 'โหลดรายการใบแจ้งหนี้ไม่สำเร็จ') })
    }
  },
  createInvoice: async (payload) => {
    set({ isSubmitting: true })
    try {
      const invoice = await api.createInvoice(payload)
      set((state) => ({ invoices: [invoice, ...state.invoices], isSubmitting: false }))
    } catch (error) {
      set({ isSubmitting: false })
      if (error instanceof ApiError) throw error
      throw new Error(getErrorMessage(error, 'สร้างใบแจ้งหนี้ไม่สำเร็จ'))
    }
  },
  markInvoiceAsPaid: async (id, payload) => {
    set({ isSubmitting: true })
    try {
      const invoice = await api.payInvoice(id, payload)
      set((state) => ({ invoices: state.invoices.map((item) => item.id === id ? invoice : item), isSubmitting: false }))
    } catch (error) {
      set({ isSubmitting: false })
      if (error instanceof ApiError) throw error
      throw new Error(getErrorMessage(error, 'บันทึกการชำระเงินไม่สำเร็จ'))
    }
  },
}))
