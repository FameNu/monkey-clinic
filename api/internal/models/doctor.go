package models

import "github.com/google/uuid"

type Doctor struct {
	BaseModel
	UserID          *uuid.UUID       `gorm:"type:uuid;uniqueIndex" json:"user_id"`
	User            *User            `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Prefix          string           `gorm:"type:varchar(20);not null" json:"prefix"` // นพ., พญ., ทพ., ทพญ.
	FullName        string           `gorm:"type:varchar(150);not null" json:"full_name"`
	Specialization  string           `gorm:"type:varchar(100);not null" json:"specialization"`
	LicenseNumber   string           `gorm:"type:varchar(50);uniqueIndex;not null" json:"license_number"`
	Phone           string           `gorm:"type:varchar(20)" json:"phone"`
	ConsultationFee float64          `gorm:"type:decimal(10,2);default:500.00" json:"consultation_fee"`
	IsActive        bool             `gorm:"default:true" json:"is_active"`
	Schedules       []DoctorSchedule `gorm:"foreignKey:DoctorID" json:"schedules,omitempty"`
}

type DoctorSchedule struct {
	BaseModel
	DoctorID        uuid.UUID `gorm:"type:uuid;not null;index" json:"doctor_id"`
	DayOfWeek       int       `gorm:"not null" json:"day_of_week"`                // 0 = Sunday ... 6 = Saturday
	StartTime       string    `gorm:"type:varchar(5);not null" json:"start_time"` // "09:00"
	EndTime         string    `gorm:"type:varchar(5);not null" json:"end_time"`   // "16:00"
	SlotDurationMin int       `gorm:"default:30" json:"slot_duration_min"`
}
