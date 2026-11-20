package models

import (
	"time"

	"github.com/google/uuid"
)

type Patient struct {
	BaseModel
	HNCode          string           `gorm:"type:varchar(20);uniqueIndex;not null" json:"hn_code"`
	Prefix          string           `gorm:"type:varchar(20);not null" json:"prefix"`             // เช่น นาย, นาง, นางสาว, ด.ช., ด.ญ.
	FullName        string           `gorm:"type:varchar(150);not null" json:"full_name"`
	Phone           string           `gorm:"type:varchar(20);index;not null" json:"phone"`
	DateOfBirth     *time.Time       `json:"date_of_birth"`
	Gender          string           `gorm:"type:varchar(10);not null;check:gender IN ('male', 'female')" json:"gender"` // male, female only
	BloodType       string           `gorm:"type:varchar(5)" json:"blood_type"`
	ChronicDiseases string           `gorm:"type:text" json:"chronic_diseases"`
	Allergies       []PatientAllergy `gorm:"foreignKey:PatientID" json:"allergies,omitempty"`
}

type PatientAllergy struct {
	BaseModel
	PatientID    uuid.UUID  `gorm:"type:uuid;not null;index" json:"patient_id"`
	MedicationID uuid.UUID  `gorm:"type:uuid;not null;index" json:"medication_id"`
	Medication   Medication `gorm:"foreignKey:MedicationID" json:"medication,omitempty"`
	ReactionNote string     `gorm:"type:text" json:"reaction_note"`
	Severity     string     `gorm:"type:varchar(20);default:'moderate'" json:"severity"` // mild, moderate, severe
}