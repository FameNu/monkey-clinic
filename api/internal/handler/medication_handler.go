package handler

import (
	"github.com/FameNu/clinic-management-system/api/internal/dto"
	"github.com/FameNu/clinic-management-system/api/internal/models"
	"github.com/FameNu/clinic-management-system/api/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MedicationHandler struct {
	db *gorm.DB
}

func NewMedicationHandler(db *gorm.DB) *MedicationHandler {
	return &MedicationHandler{db: db}
}

func (h *MedicationHandler) GetMedications(c *fiber.Ctx) error {
	var meds []models.Medication
	query := h.db.Order("name asc")

	if search := c.Query("search"); search != "" {
		like := "%" + search + "%"
		query = query.Where("name ILIKE ? OR generic_name ILIKE ?", like, like)
	}
	if c.Query("low_stock") == "true" {
		query = query.Where("stock_quantity <= min_stock_alert")
	}

	if err := query.Find(&meds).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "error",
			"message": "Failed to retrieve medications",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"medications": meds,
	})
}

func (h *MedicationHandler) CreateMedication(c *fiber.Ctx) error {
	var req dto.CreateMedicationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request body",
		})
	}

	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Validation failed",
			"errors":  errs,
		})
	}

	med := models.Medication{
		Code:          req.Code,
		Name:          req.Name,
		GenericName:   req.GenericName,
		Unit:          req.Unit,
		PricePerUnit:  req.PricePerUnit,
		StockQuantity: req.StockQuantity,
		MinStockAlert: req.MinStockAlert,
		Note:          req.Note,
	}

	if err := h.db.Create(&med).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create medication",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":     "success",
		"medication": med,
	})
}

func (h *MedicationHandler) RestockMedication(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid medication ID",
		})
	}

	var req dto.UpdateStockRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request body",
		})
	}

	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Validation failed",
			"errors":  errs,
		})
	}

	result := h.db.Model(&models.Medication{}).
		Where("id = ?", id).
		UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", req.AddQuantity))
	
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to restock medication",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Medication not found",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Medication restocked successfully",
	})
}