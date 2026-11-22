package models

type User struct {
	BaseModel
	Email        string `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash string `gorm:"not null" json:"-"`
	Prefix       string `gorm:"type:varchar(20);not null" json:"prefix"` // นาย, นาง, นางสาว,
	FullName     string `gorm:"type:varchar(150);not null" json:"full_name"`
	Phone        string `gorm:"type:varchar(20)" json:"phone"`
	Role         string `gorm:"type:varchar(20);not null;default:'receptionist'" json:"role"` // admin, receptionist, doctor
	IsActive     bool   `gorm:"default:true" json:"is_active"`
}
