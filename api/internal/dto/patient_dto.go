package dto

import "github.com/google/uuid"

type CreatePatientRequest struct {
	Prefix           string `json:"prefix" validate:"required"` // นาย, นาง, นางสาว, ด.ช., ด.ญ.
	FullName         string `json:"full_name" validate:"required"`
	NationalID       string `json:"national_id"`
	Phone            string `json:"phone" validate:"required"`
	Address          string `json:"address"`
	EmergencyContact string `json:"emergency_contact"`
	DateOfBirth      string `json:"date_of_birth"` // format "YYYY-MM-DD"
	Gender           string `json:"gender" validate:"required,oneof=male female"`
	BloodType        string `json:"blood_type" validate:"omitempty,oneof=A B AB O"`
	ChronicDiseases  string `json:"chronic_diseases"`
}

type UpdatePatientRequest struct {
	Prefix           string                  `json:"prefix" validate:"required"`
	FullName         string                  `json:"full_name" validate:"required"`
	NationalID       string                  `json:"national_id"`
	Phone            string                  `json:"phone" validate:"required"`
	Address          string                  `json:"address"`
	EmergencyContact string                  `json:"emergency_contact"`
	DateOfBirth      string                  `json:"date_of_birth"`
	Gender           string                  `json:"gender" validate:"required,oneof=male female"`
	BloodType        string                  `json:"blood_type" validate:"omitempty,oneof=A B AB O"`
	ChronicDiseases  string                  `json:"chronic_diseases"`
	Allergies        []PatientAllergyRequest `json:"allergies"`
}

type PatientAllergyRequest struct {
	MedicationID uuid.UUID `json:"medication_id" validate:"required"`
	ReactionNote string    `json:"reaction_note" validate:"required"`
	Severity     string    `json:"severity" validate:"required,oneof=mild moderate severe"`
}

type AddPatientAllergyRequest struct {
	MedicationID uuid.UUID `json:"medication_id" validate:"required"`
	ReactionNote string    `json:"reaction_note" validate:"required"`
	Severity     string    `json:"severity" validate:"required,oneof=mild moderate severe"`
}
