package handler

import (
	"time"

	"github.com/FameNu/clinic-management-system/api/internal/dto"
	"github.com/FameNu/clinic-management-system/api/internal/models"
	"github.com/FameNu/clinic-management-system/api/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AppointmentHandler struct {
	db *gorm.DB
}

func NewAppointmentHandler(db *gorm.DB) *AppointmentHandler {
	return &AppointmentHandler{db: db}
}

func (h *AppointmentHandler) CreateAppointment(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized",
		})
	}

	var req dto.CreateAppointmentRequest
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

	if _, err := time.Parse("2006-01-02", req.AppointmentDate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid appointment_date format (expected YYYY-MM-DD)",
		})
	}
	startParsed, errStart := time.Parse("15:04", req.StartTime)
	endParsed, errEnd := time.Parse("15:04", req.EndTime)
	if errStart != nil || errEnd != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid time format (expected HH:MM)",
		})
	}
	if !endParsed.After(startParsed) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "end_time must be after start_time",
		})
	}

	// check for overlapping appointments for the same doctor
	var conflictCount int64
	h.db.Model(&models.Appointment{}).
		Where("doctor_id = ? AND appointment_date = ? AND status NOT IN ?", req.DoctorID, req.AppointmentDate, []string{"cancelled", "no_show"}).
		Where("start_time < ? AND end_time > ?", req.EndTime, req.StartTime).
		Count(&conflictCount)

	if conflictCount > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"status":  "error",
			"message": "Doctor already has an overlapping appointment during this time slot",
		})
	}

	appointment := models.Appointment{
		PatientID:       req.PatientID,
		DoctorID:        req.DoctorID,
		AppointmentDate: req.AppointmentDate,
		StartTime:       req.StartTime,
		EndTime:         req.EndTime,
		Status:          "scheduled",
		Reason:          req.Reason,
		CreatedBy:       userID,
	}

	if err := h.db.Create(&appointment).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create appointment (verify patient_id and doctor_id)",
		})
	}

	h.db.Preload("Patient").Preload("Doctor").First(&appointment, "id = ?", appointment.ID)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data":   appointment,
	})
}

// GetAppointments ดึงรายการนัดหมาย (รองรับ ?date=YYYY-MM-DD, ?doctor_id=..., ?status=...)
func (h *AppointmentHandler) GetAppointments(c *fiber.Ctx) error {
	var appointments []models.Appointment
	query := h.db.
		Preload("Patient.Allergies.Medication").
		Preload("Doctor").
		Preload("MedicalRecord.Prescriptions.Medication").
		Preload("Invoice").
		Order("appointment_date asc, start_time asc")

	if doctorID := c.Query("doctor_id"); doctorID != "" {
		query = query.Where("doctor_id = ?", doctorID)
	}
	if c.Locals("role") == "doctor" {
		doctorID, err := currentDoctorID(h.db, c)
		if err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"status": "error", "message": "Doctor profile is not linked to this account"})
		}
		query = query.Where("doctor_id = ?", doctorID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if dateStr := c.Query("date"); dateStr != "" {
		query = query.Where("appointment_date = ?", dateStr)
	}

	if err := query.Find(&appointments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to fetch appointments",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   appointments,
	})
}

func (h *AppointmentHandler) GetAppointmentByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid appointment ID",
		})
	}
	var appointment models.Appointment
	if err := h.db.Preload("Patient.Allergies.Medication").Preload("Doctor").
		Preload("MedicalRecord.Prescriptions.Medication").Preload("Invoice").
		First(&appointment, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Appointment not found",
		})
	}
	if c.Locals("role") == "doctor" {
		doctorID, err := currentDoctorID(h.db, c)
		if err != nil || appointment.DoctorID != doctorID {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"status": "error", "message": "You can only access appointments assigned to you"})
		}
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   appointment,
	})
}

func (h *AppointmentHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid appointment ID",
		})
	}

	var req dto.UpdateAppointmentStatusRequest
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

	var appointment models.Appointment
	if err := h.db.First(&appointment, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Appointment not found"})
	}
	if c.Locals("role") == "doctor" {
		doctorID, err := currentDoctorID(h.db, c)
		if err != nil || appointment.DoctorID != doctorID {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"status": "error", "message": "You can only update appointments assigned to you"})
		}
	}
	result := h.db.Model(&models.Appointment{}).Where("id = ?", id).Update("status", req.Status)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to update status",
		})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Appointment not found",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Appointment status updated",
	})
}

func currentDoctorID(db *gorm.DB, c *fiber.Ctx) (uuid.UUID, error) {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil, fiber.NewError(fiber.StatusUnauthorized, "Unauthorized")
	}
	var doctor models.Doctor
	if err := db.Select("id").Where("user_id = ?", userID).First(&doctor).Error; err != nil {
		return uuid.Nil, err
	}
	return doctor.ID, nil
}
