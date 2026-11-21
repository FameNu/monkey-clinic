package dto

import "github.com/google/uuid"

type PrescriptionInput struct {
	MedicationID      uuid.UUID `json:"medication_id" validate:"required"`
	Quantity          int       `json:"quantity" validate:"required,min=1"`
	DosageInstruction string    `json:"dosage_instruction" validate:"required"` // เช่น รับประทานครั้งละ 1 เม็ด หลังอาหาร เช้า-เย็น
}

type CreateMedicalRecordRequest struct {
	AppointmentID          uuid.UUID           `json:"appointment_id" validate:"required"`
	Diagnosis              string              `json:"diagnosis" validate:"required"`
	Symptoms               string              `json:"symptoms"`
	TreatmentNotes         string              `json:"treatment_notes"`
	Prescriptions          []PrescriptionInput `json:"prescriptions" validate:"dive"`
	OverrideAllergyWarning bool                `json:"override_allergy_warning"`
}
