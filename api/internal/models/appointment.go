package models

import (
	"time"

	"github.com/google/uuid"
)

type Appointment struct {
	BaseModel
	PatientID       uuid.UUID      `gorm:"type:uuid;not null;index" json:"patient_id"`
	Patient         Patient        `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	DoctorID        uuid.UUID      `gorm:"type:uuid;not null;index:idx_doctor_date_time" json:"doctor_id"`
	Doctor          Doctor         `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	AppointmentDate string         `gorm:"type:varchar(10);not null;index:idx_doctor_date_time" json:"appointment_date"` // YYYY-MM-DD
	StartTime       string         `gorm:"type:varchar(5);not null;index:idx_doctor_date_time" json:"start_time"`        // HH:MM
	EndTime         string         `gorm:"type:varchar(5);not null" json:"end_time"`                                     // HH:MM
	Status          string         `gorm:"type:varchar(20);not null;default:'scheduled'" json:"status"`                  // scheduled, checked_in, in_progress, completed, cancelled, no_show
	Reason          string         `gorm:"type:text" json:"reason"`
	CreatedBy       uuid.UUID      `gorm:"type:uuid;not null" json:"created_by"`
	MedicalRecord   *MedicalRecord `gorm:"foreignKey:AppointmentID" json:"medical_record,omitempty"`
	Invoice         *Invoice       `gorm:"foreignKey:AppointmentID" json:"invoice,omitempty"`
}

type MedicalRecord struct {
	BaseModel
	AppointmentID  uuid.UUID          `gorm:"type:uuid;uniqueIndex;not null" json:"appointment_id"`
	Diagnosis      string             `gorm:"type:text;not null" json:"diagnosis"`
	Symptoms       string             `gorm:"type:text" json:"symptoms"`
	TreatmentNotes string             `gorm:"type:text" json:"treatment_notes"`
	Prescriptions  []PrescriptionItem `gorm:"foreignKey:MedicalRecordID" json:"prescriptions,omitempty"`
}

type PrescriptionItem struct {
	BaseModel
	MedicalRecordID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"medical_record_id"`
	MedicationID      uuid.UUID  `gorm:"type:uuid;not null" json:"medication_id"`
	Medication        Medication `gorm:"foreignKey:MedicationID" json:"medication,omitempty"`
	Quantity          int        `gorm:"not null" json:"quantity"`
	DosageInstruction string     `gorm:"type:text;not null" json:"dosage_instruction"`
	UnitPrice         float64    `gorm:"type:decimal(10,2);not null" json:"unit_price"`
}

type Invoice struct {
	BaseModel
	InvoiceNumber   string     `gorm:"type:varchar(30);uniqueIndex;not null" json:"invoice_number"`
	AppointmentID   uuid.UUID  `gorm:"type:uuid;uniqueIndex;not null" json:"appointment_id"`
	DoctorFee       float64    `gorm:"type:decimal(10,2);not null" json:"doctor_fee"`
	MedicationTotal float64    `gorm:"type:decimal(10,2);not null" json:"medication_total"`
	Discount        float64    `gorm:"type:decimal(10,2);default:0" json:"discount"`
	TotalAmount     float64    `gorm:"type:decimal(10,2);not null" json:"total_amount"`
	PaymentMethod   string     `gorm:"type:varchar(20)" json:"payment_method"`                           // cash, promptpay, credit_card
	PaymentStatus   string     `gorm:"type:varchar(20);not null;default:'unpaid'" json:"payment_status"` // unpaid, paid, cancelled
	PaidAt          *time.Time `json:"paid_at"`
}
