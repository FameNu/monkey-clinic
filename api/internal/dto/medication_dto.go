package dto

type CreateMedicationRequest struct {
	Code          string  `json:"code" validate:"required"`
	Name          string  `json:"name" validate:"required"`
	GenericName   string  `json:"generic_name"`
	Unit          string  `json:"unit" validate:"required"` // เม็ด แคปซูล ขวด ฯลฯ
	PricePerUnit  float64 `json:"price_per_unit" validate:"min=0"`
	StockQuantity int     `json:"stock_quantity" validate:"min=0"`
	MinStockAlert int     `json:"min_stock_alert" validate:"min=0"`
}

type UpdateStockRequest struct {
	AddQuantity int `json:"add_quantity" validate:"required,min=1"`
}
