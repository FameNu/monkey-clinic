package dto

import "github.com/google/uuid"

type CreateAppointmentRequest struct {
	PatientID       uuid.UUID `json:"patient_id" validate:"required"`
	DoctorID        uuid.UUID `json:"doctor_id" validate:"required"`
	AppointmentDate string    `json:"appointment_date" validate:"required"` // รูปแบบ "YYYY-MM-DD" เช่น "2026-11-25"
	StartTime       string    `json:"start_time" validate:"required"`       // รูปแบบ "HH:MM" เช่น "10:00"
	EndTime         string    `json:"end_time" validate:"required"`         // รูปแบบ "HH:MM" เช่น "10:30"
	Reason          string    `json:"reason" validate:"required"`
}

type UpdateAppointmentStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=scheduled checked_in in_progress completed cancelled no_show"`
}