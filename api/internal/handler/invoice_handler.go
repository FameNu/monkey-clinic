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

type InvoiceHandler struct {
	db *gorm.DB
}

func NewInvoiceHandler(db *gorm.DB) *InvoiceHandler {
	return &InvoiceHandler{db: db}
}

func (h *InvoiceHandler) CreateInvoice(c *fiber.Ctx) error {
	var req dto.CreateInvoiceRequest
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
	if err := h.db.Preload("Doctor").Preload("Invoice").
		Preload("MedicalRecord.Prescriptions").
		First(&appointment, "id = ?", req.AppointmentID).
		Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Appointment not found",
		})
	}
	if appointment.Status != "completed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invoice can only be created for completed appointments",
		})
	}
	if appointment.Invoice != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"status":  "error",
			"message": "An invoice already exists for this appointment",
		})
	}

	doctorFee := appointment.Doctor.ConsultationFee
	var medicationTotal float64
	if appointment.MedicalRecord != nil {
		for _, item := range appointment.MedicalRecord.Prescriptions {
			medicationTotal += float64(item.Quantity) * item.UnitPrice
		}
	}

	totalAmount := (doctorFee + medicationTotal) - req.Discount
	if totalAmount < 0 {
		totalAmount = 0
	}

	var count int64
	h.db.Model(&models.Invoice{}).Unscoped().Count(&count)
	invoiceNumber := fmt.Sprintf("INV-%s-%04d", time.Now().Format("20060102"), count+1)

	invoice := models.Invoice{
		InvoiceNumber:   invoiceNumber,
		AppointmentID:   appointment.ID,
		DoctorFee:       doctorFee,
		MedicationTotal: medicationTotal,
		Discount:        req.Discount,
		TotalAmount:     totalAmount,
		PaymentStatus:   "unpaid",
	}

	if err := h.db.Create(&invoice).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create invoice",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data":   invoice,
	})
}

func (h *InvoiceHandler) PayInvoice(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid invoice ID",
		})
	}

	var req dto.PayInvoiceRequest
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

	now := time.Now()
	result := h.db.Model(&models.Invoice{}).
		Where("id = ? AND payment_status = ?", id, "unpaid").
		Updates(map[string]interface{}{
			"payment_status": "paid",
			"paid_at":        &now,
			"payment_method": req.PaymentMethod,
		})

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to update invoice",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Invoice not found or already paid",
		})
	}

	var updatedInvoice models.Invoice
	h.db.Preload("Appointment.Patient").Preload("Appointment.Doctor").
		Preload("Appointment.MedicalRecord").First(&updatedInvoice, "id = ?", id)

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   updatedInvoice,
	})
}

func (h *InvoiceHandler) GetInvoices(c *fiber.Ctx) error {
	var invoices []models.Invoice
	query := h.db.Preload("Appointment.Patient").Preload("Appointment.Doctor").Preload("Appointment.MedicalRecord").Order("created_at desc")
	if status := c.Query("status"); status != "" {
		query = query.Where("payment_status = ?", status)
	}
	if err := query.Find(&invoices).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to fetch invoices",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   invoices,
	})
}
