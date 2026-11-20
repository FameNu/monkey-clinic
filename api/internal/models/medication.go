package models

type Medication struct {
	BaseModel
	Code          string  `gorm:"type:varchar(30);uniqueIndex;not null" json:"code"`
	Name          string  `gorm:"type:varchar(150);not null" json:"name"`
	GenericName   string  `gorm:"type:varchar(150);index;not null" json:"generic_name"` // ใช้เช็กแพ้ยา
	Unit          string  `gorm:"type:varchar(30);not null" json:"unit"`                // เม็ด(Pill), ขวด(Bottle), แผง(Pack), etc.
	PricePerUnit  float64 `gorm:"type:decimal(10,2);not null" json:"price_per_unit"`
	StockQuantity int     `gorm:"not null;default:0" json:"stock_quantity"`
	MinStockAlert int     `gorm:"not null;default:10" json:"min_stock_alert"`
}