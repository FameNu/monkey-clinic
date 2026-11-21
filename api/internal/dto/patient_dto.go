package dto

import "github.com/google/uuid"

type CreatePatientRequest struct {
	Prefix          string `json:"prefix" validate:"required"` // นาย, นาง, นางสาว, ด.ช., ด.ญ.
	FullName        string `json:"full_name" validate:"required"`
	Phone           string `json:"phone" validate:"required"`
	DateOfBirth     string `json:"date_of_birth"` // format "YYYY-MM-DD"
	Gender          string `json:"gender" validate:"required,oneof=male female"`
	BloodType       string `json:"blood_type" validate:"omitempty,oneof=A B AB O"`
	ChronicDiseases string `json:"chronic_diseases"`
}

type AddPatientAllergyRequest struct {
	MedicationID uuid.UUID `json:"medication_id" validate:"required"`
	ReactionNote string    `json:"reaction_note" validate:"required"`
	Severity     string    `json:"severity" validate:"required,oneof=mild moderate severe"`
}