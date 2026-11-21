export interface Medication {
  id: string
  code: string
  name: string
  generic_name?: string
  unit: string
  price_per_unit: number
  stock_quantity: number
  min_stock_alert: number
}
