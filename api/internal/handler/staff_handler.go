package handler

import (
	"github.com/FameNu/clinic-management-system/api/internal/dto"
	"github.com/FameNu/clinic-management-system/api/internal/models"
	"github.com/FameNu/clinic-management-system/api/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type StaffHandler struct {
	db *gorm.DB
}

func NewStaffHandler(db *gorm.DB) *StaffHandler {
	return &StaffHandler{db: db}
}

// Create user account for a staff member
func (h *StaffHandler) CreateUser(c *fiber.Ctx) error {
	var req dto.CreateUserRequest
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

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to hash password",
		})
	}

	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashed),
		Prefix:       req.Prefix,
		FullName:     req.FullName,
		Role:         req.Role,
		IsActive:     true,
	}

	if err := h.db.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create user",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"id":        user.ID,
			"email":     user.Email,
			"prefix":    user.Prefix,
			"full_name": user.FullName,
			"role":      user.Role,
			"is_active": user.IsActive,
		},
	})
}

func (h *StaffHandler) CreateDoctor(c *fiber.Ctx) error {
	var req dto.CreateDoctorRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "errors": errs})
	}

	var doctor models.Doctor

	// ใช้ Transaction เพื่อรับประกันว่าถ้าสร้าง User + Doctor ต้องสำเร็จคู่กัน
	err := h.db.Transaction(func(tx *gorm.DB) error {
		var userID *uuid.UUID

		if req.CreateAccount {
			if req.Email == "" || req.Password == "" {
				return fiber.NewError(fiber.StatusBadRequest, "Email and password are required when create_account is true")
			}
			hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			if err != nil {
				return err
			}
			user := models.User{
				Email:        req.Email,
				PasswordHash: string(hashed),
				Prefix:       req.Prefix,
				FullName:     req.FullName,
				Role:         "doctor",
				IsActive:     true,
			}
			if err := tx.Create(&user).Error; err != nil {
				return fiber.NewError(fiber.StatusConflict, "Email already exists")
			}
			userID = &user.ID
		}

		fee := req.ConsultationFee
		if fee == 0 {
			fee = 500.00
		}

		doctor = models.Doctor{
			UserID:          userID,
			Prefix:          req.Prefix,
			FullName:        req.FullName,
			Specialization:  req.Specialization,
			LicenseNumber:   req.LicenseNumber,
			Phone:           req.Phone,
			ConsultationFee: fee,
			IsActive:        true,
		}

		if err := tx.Create(&doctor).Error; err != nil {
			return fiber.NewError(fiber.StatusConflict, "License number already exists")
		}
		return nil
	})

	if err != nil {
		if fiberErr, ok := err.(*fiber.Error); ok {
			return c.Status(fiberErr.Code).JSON(fiber.Map{"status": "error", "message": fiberErr.Message})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to create doctor"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": doctor})
}

func (h *StaffHandler) GetDoctors(c *fiber.Ctx) error {
	var doctors []models.Doctor
	if err := h.db.Find(&doctors).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to fetch doctors",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   doctors,
	})
}

func (h *StaffHandler) AddDoctorSchedule(c *fiber.Ctx) error {
	doctorID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"message": "Invalid doctor ID",
		})
	}

	var req dto.DoctorScheduleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"message": "Invalid request body",
		})
	}
	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"errors": errs,
		})
	}

	slot := req.SlotDurationMin
	if slot == 0 {
		slot = 30
	}

	schedule := models.DoctorSchedule{
		DoctorID:        doctorID,
		DayOfWeek:       req.DayOfWeek,
		StartTime:       req.StartTime,
		EndTime:         req.EndTime,
		SlotDurationMin: slot,
	}

	if err := h.db.Create(&schedule).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "error",
			"message": "Failed to add schedule",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data": schedule,
	})
}
