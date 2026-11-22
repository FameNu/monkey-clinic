package handler

import (
	"fmt"
	"strings"

	"github.com/FameNu/clinic-management-system/api/internal/dto"
	"github.com/FameNu/clinic-management-system/api/internal/models"
	"github.com/FameNu/clinic-management-system/api/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ClinicalHandler struct {
	db *gorm.DB
}

func NewClinicalHandler(db *gorm.DB) *ClinicalHandler {
	return &ClinicalHandler{db: db}
}

func (h *ClinicalHandler) CreateMedicalRecord(c *fiber.Ctx) error {
	var req dto.CreateMedicalRecordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "errors": errs})
	}

	var createdRecord models.MedicalRecord

	err := h.db.Transaction(func(tx *gorm.DB) error {
		// 1. ดึงข้อมูลนัดหมายพร้อมประวัติแพ้ยาของคนไข้
		var appointment models.Appointment
		if err := tx.Preload("Patient.Allergies.Medication").First(&appointment, "id = ?", req.AppointmentID).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Appointment not found")
		}
		if appointment.Status == "cancelled" || appointment.Status == "no_show" {
			return fiber.NewError(fiber.StatusBadRequest, "Cannot record examination for cancelled or no_show appointment")
		}

		// Key: MedicationID, Value: PatientAllergy
		// Create a map of the patient's allergies for quick lookup [O(1)]
		allergyMap := make(map[uuid.UUID]models.PatientAllergy)
		allergyGenerics := make(map[string]models.PatientAllergy)
		for _, a := range appointment.Patient.Allergies {
			allergyMap[a.MedicationID] = a
			if generic := strings.ToLower(strings.TrimSpace(a.Medication.GenericName)); generic != "" {
				allergyGenerics[generic] = a
			}
		}

		record := models.MedicalRecord{
			AppointmentID:  req.AppointmentID,
			Diagnosis:      req.Diagnosis,
			Symptoms:       req.Symptoms,
			TreatmentNotes: req.TreatmentNotes,
		}
		if err := tx.Create(&record).Error; err != nil {
			return fiber.NewError(fiber.StatusConflict, "Medical record already exists for this appointment")
		}

		for _, item := range req.Prescriptions {
			// Lock row of medication to prevent 'Race Condition' when updating stock quantity
			var med models.Medication
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&med, "id = ?", item.MedicationID).Error; err != nil {
				return fiber.NewError(fiber.StatusNotFound, fmt.Sprintf("Medication %s not found", item.MedicationID))
			}

			allergy, isAllergic := allergyMap[med.ID]
			if !isAllergic {
				allergy, isAllergic = allergyGenerics[strings.ToLower(strings.TrimSpace(med.GenericName))]
			}
			if isAllergic && !req.OverrideAllergyWarning {
				return fiber.NewError(
					fiber.StatusConflict,
					fmt.Sprintf("ALLERGY ALERT: Patient is allergic to %s (Severity: %s, Note: %s). Set override_allergy_warning=true to proceed.",
						med.Name,
						allergy.Severity,
						allergy.ReactionNote,
					),
				)
			}

			if med.StockQuantity < item.Quantity {
				return fiber.NewError(
					fiber.StatusBadRequest,
					fmt.Sprintf("Insufficient stock for %s (available: %d, requested: %d)", med.Name, med.StockQuantity, item.Quantity),
				)
			}

			// Create a prescription item with the current price of the medication
			prescription := models.PrescriptionItem{
				MedicalRecordID:   record.ID,
				MedicationID:      med.ID,
				Quantity:          item.Quantity,
				DosageInstruction: item.DosageInstruction,
				UnitPrice:         med.PricePerUnit,
			}
			if err := tx.Create(&prescription).Error; err != nil {
				return err
			}

			if err := tx.Model(&med).Update("stock_quantity", med.StockQuantity-item.Quantity).Error; err != nil {
				return err
			}
		}

		// Update appointment status to "completed"
		if err := tx.Model(&appointment).Update("status", "completed").Error; err != nil {
			return err
		}

		createdRecord = record
		return nil
	})

	if err != nil {
		if fiberErr, ok := err.(*fiber.Error); ok {
			return c.Status(fiberErr.Code).JSON(fiber.Map{"status": "error", "message": fiberErr.Message})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to save medical record",
		})
	}

	h.db.Preload("Prescriptions.Medication").First(&createdRecord, "id = ?", createdRecord.ID)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data":   createdRecord,
	})
}

func (h *ClinicalHandler) GetPatientHistory(c *fiber.Ctx) error {
	patientID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid patient ID",
		})
	}

	var appointments []models.Appointment
	err = h.db.
		Preload("Doctor").
		Preload("MedicalRecord.Prescriptions.Medication").
		Preload("Invoice").
		Where("patient_id = ? AND status = ?", patientID, "completed").
		Order("appointment_date desc, start_time desc").
		Find(&appointments).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to fetch medical history",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   appointments,
	})
}
