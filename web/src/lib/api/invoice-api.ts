import apiClient from '@/lib/axios-instance'
import { ApiResponse, CreateInvoiceRequest, Invoice, PayInvoiceRequest } from '@/types'

export const invoiceApi = () => ({
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>('/invoices')
    return response.data.data ?? []
  },
  createInvoice: async (payload: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>('/invoices', payload)
    return response.data.data
  },
  payInvoice: async (id: string, payload: PayInvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.patch<ApiResponse<Invoice>>(
      `/invoices/${id}/pay`,
      payload,
    )
    return response.data.data
  },
})
