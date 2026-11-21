package dto

import "github.com/google/uuid"

type CreateUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Prefix   string `json:"prefix" validate:"required"`
	FullName string `json:"full_name" validate:"required"`
	Role     string `json:"role" validate:"required,oneof=admin receptionist doctor"`
}

type CreateDoctorRequest struct {
	CreateAccount   bool    `json:"create_account"` // true = create a new user account for the doctor
	Email           string  `json:"email" validate:"omitempty,email"`
	Password        string  `json:"password" validate:"omitempty,min=6"`
	Prefix          string  `json:"prefix" validate:"required"` // นพ., พญ., ทพ., ทพญ., etc.
	FullName        string  `json:"full_name" validate:"required"`
	Specialization  string  `json:"specialization" validate:"required"`
	LicenseNumber   string  `json:"license_number" validate:"required"`
	Phone           string  `json:"phone"`
	ConsultationFee float64 `json:"consultation_fee" validate:"min=0"`
}

type DoctorScheduleRequest struct {
	DayOfWeek       int    `json:"day_of_week" validate:"min=0,max=6"` // 0=Sunday ... 6=Saturday
	StartTime       string `json:"start_time" validate:"required"`     // format "09:00"
	EndTime         string `json:"end_time" validate:"required"`       // format "16:00"
	SlotDurationMin int    `json:"slot_duration_min" validate:"min=10"`
}

type DoctorResponse struct {
	ID              uuid.UUID  `json:"id"`
	UserID          *uuid.UUID `json:"user_id"`
	Prefix          string     `json:"prefix"`
	FullName        string     `json:"full_name"`
	Specialization  string     `json:"specialization"`
	LicenseNumber   string     `json:"license_number"`
	Phone           string     `json:"phone"`
	ConsultationFee float64    `json:"consultation_fee"`
	IsActive        bool       `json:"is_active"`
}