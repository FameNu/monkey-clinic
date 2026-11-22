package handler

import (
	"fmt"
	"time"

	"github.com/FameNu/clinic-management-system/api/internal/dto"
	"github.com/FameNu/clinic-management-system/api/internal/models"
	"github.com/FameNu/clinic-management-system/api/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PatientHandler struct {
	db *gorm.DB
}

func NewPatientHandler(db *gorm.DB) *PatientHandler {
	return &PatientHandler{db: db}
}

func (h *PatientHandler) CreatePatient(c *fiber.Ctx) error {
	var req dto.CreatePatientRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request body",
		})
	}
	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": errs,
		})
	}

	var dob *time.Time
	if req.DateOfBirth != "" {
		parsedDOB, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status":  "error",
				"message": "Invalid date_of_birth format. Use YYYY-MM-DD.",
			})
		}
		dob = &parsedDOB
	}

	var count int64
	h.db.Model(&models.Patient{}).Unscoped().Count(&count)
	hnCode := fmt.Sprintf("HN-%d%04d", time.Now().Year(), count+1)

	patient := models.Patient{
		HNCode:           hnCode,
		Prefix:           req.Prefix,
		FullName:         req.FullName,
		NationalID:       optionalString(req.NationalID),
		Phone:            req.Phone,
		Address:          req.Address,
		EmergencyContact: req.EmergencyContact,
		DateOfBirth:      dob,
		Gender:           req.Gender,
		BloodType:        req.BloodType,
		ChronicDiseases:  req.ChronicDiseases,
	}

	if err := h.db.Create(&patient).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create patient",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data":   patient,
	})
}

func (h *PatientHandler) GetPatients(c *fiber.Ctx) error {
	search := c.Query("search")
	var patients []models.Patient

	query := h.db.Preload("Allergies.Medication").Order("created_at desc")
	if search != "" {
		like := "%" + search + "%"
		query = query.Where("full_name ILIKE ? OR phone ILIKE ? OR hn_code ILIKE ? OR national_id ILIKE ?", like, like, like, like)
	}

	if err := query.Find(&patients).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to fetch patients",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   patients,
	})
}

func (h *PatientHandler) UpdatePatient(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid patient ID"})
	}
	var req dto.UpdatePatientRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation failed", "errors": errs})
	}

	var dob *time.Time
	if req.DateOfBirth != "" {
		parsed, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid date_of_birth format. Use YYYY-MM-DD."})
		}
		dob = &parsed
	}
	for _, allergy := range req.Allergies {
		if errs := utils.ValidateStruct(allergy); len(errs) > 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid allergy data", "errors": errs})
		}
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"prefix": req.Prefix, "full_name": req.FullName,
			"national_id": optionalString(req.NationalID), "phone": req.Phone,
			"address": req.Address, "emergency_contact": req.EmergencyContact,
			"date_of_birth": dob, "gender": req.Gender, "blood_type": req.BloodType,
			"chronic_diseases": req.ChronicDiseases,
		}
		result := tx.Model(&models.Patient{}).Where("id = ?", id).Updates(updates)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}
		if err := tx.Where("patient_id = ?", id).Delete(&models.PatientAllergy{}).Error; err != nil {
			return err
		}
		for _, item := range req.Allergies {
			allergy := models.PatientAllergy{PatientID: id, MedicationID: item.MedicationID, ReactionNote: item.ReactionNote, Severity: item.Severity}
			if err := tx.Create(&allergy).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err == gorm.ErrRecordNotFound {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Patient not found"})
	}
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Could not update patient or allergy information"})
	}
	var patient models.Patient
	if err := h.db.Preload("Allergies.Medication").First(&patient, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to reload patient"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": patient})
}

func optionalString(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func (h *PatientHandler) GetPatientByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid patient ID",
		})
	}

	var patient models.Patient
	if err := h.db.Preload("Allergies.Medication").First(&patient, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Patient not found",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   patient,
	})
}

func (h *PatientHandler) AddPatientAllergy(c *fiber.Ctx) error {
	patientID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid patient ID",
		})
	}

	var req dto.AddPatientAllergyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request body",
		})
	}
	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"errors": errs,
		})
	}

	allergy := models.PatientAllergy{
		PatientID:    patientID,
		MedicationID: req.MedicationID,
		ReactionNote: req.ReactionNote,
		Severity:     req.Severity,
	}

	if err := h.db.Create(&allergy).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to add allergy (check patient_id or medication_id)",
		})
	}

	h.db.Preload("Medication").First(&allergy, "id = ?", allergy.ID)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data":   allergy,
	})
}
