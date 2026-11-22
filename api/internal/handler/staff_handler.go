package handler

import (
	"strings"

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

func (h *StaffHandler) GetStaff(c *fiber.Ctx) error {
	query := h.db.Model(&models.User{}).Order("full_name asc")
	if role := c.Query("role"); role != "" {
		if role != "admin" && role != "receptionist" && role != "doctor" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid role filter"})
		}
		query = query.Where("role = ?", role)
	}
	if active := c.Query("active"); active != "" {
		if active != "true" && active != "false" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "active must be true or false"})
		}
		query = query.Where("is_active = ?", active == "true")
	}
	if search := strings.TrimSpace(c.Query("search")); search != "" {
		like := "%" + search + "%"
		query = query.Where("full_name ILIKE ? OR email ILIKE ? OR phone ILIKE ?", like, like, like)
	}

	var users []models.User
	if err := query.Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to fetch staff"})
	}

	userIDs := make([]uuid.UUID, 0, len(users))
	for _, user := range users {
		userIDs = append(userIDs, user.ID)
	}
	doctors := make([]models.Doctor, 0)
	if len(userIDs) > 0 {
		if err := h.db.Preload("Schedules").Where("user_id IN ?", userIDs).Find(&doctors).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to fetch doctor profiles"})
		}
	}
	doctorByUserID := make(map[uuid.UUID]*models.Doctor, len(doctors))
	for index := range doctors {
		if doctors[index].UserID != nil {
			doctorByUserID[*doctors[index].UserID] = &doctors[index]
		}
	}

	result := make([]dto.StaffResponse, 0, len(users))
	for _, user := range users {
		staff := dto.StaffResponse{
			ID: user.ID, Email: user.Email, Prefix: user.Prefix, FullName: user.FullName,
			Phone: user.Phone, Role: user.Role, IsActive: user.IsActive,
		}
		if doctor := doctorByUserID[user.ID]; doctor != nil {
			staff.Doctor = doctorToResponse(*doctor)
		}
		result = append(result, staff)
	}
	return c.JSON(fiber.Map{"status": "success", "data": result})
}

func (h *StaffHandler) CreateStaff(c *fiber.Ctx) error {
	var req dto.StaffRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation failed", "errors": errs})
	}
	if strings.TrimSpace(req.Password) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Password is required for new staff"})
	}
	if req.Role == "doctor" && (strings.TrimSpace(req.Specialization) == "" || strings.TrimSpace(req.LicenseNumber) == "") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Doctor specialty and license number are required"})
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to hash password"})
	}
	user := models.User{Email: req.Email, PasswordHash: string(hashed), Prefix: req.Prefix, FullName: req.FullName, Phone: req.Phone, Role: req.Role, IsActive: true}
	var doctor *models.Doctor
	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		if user.Role != "doctor" {
			return nil
		}
		fee := req.ConsultationFee
		if fee == 0 {
			fee = 500
		}
		created := models.Doctor{UserID: &user.ID, Prefix: user.Prefix, FullName: user.FullName, Specialization: req.Specialization, LicenseNumber: req.LicenseNumber, Phone: req.Phone, ConsultationFee: fee, Notes: req.DoctorNotes, IsActive: user.IsActive}
		if err := tx.Create(&created).Error; err != nil {
			return err
		}
		for _, schedule := range req.Schedules {
			if err := tx.Create(&models.DoctorSchedule{DoctorID: created.ID, DayOfWeek: schedule.DayOfWeek, StartTime: schedule.StartTime, EndTime: schedule.EndTime, SlotDurationMin: schedule.SlotDurationMin}).Error; err != nil {
				return err
			}
		}
		doctor = &created
		return nil
	})
	if err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "error", "message": "Could not create staff; email or doctor license may already exist"})
	}
	staff := dto.StaffResponse{ID: user.ID, Email: user.Email, Prefix: user.Prefix, FullName: user.FullName, Phone: user.Phone, Role: user.Role, IsActive: user.IsActive}
	if doctor != nil {
		staff.Doctor = doctorToResponse(*doctor)
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": staff})
}

func (h *StaffHandler) UpdateStaff(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid staff ID"})
	}
	actorID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	var req dto.StaffRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body"})
	}
	if errs := utils.ValidateStruct(req); len(errs) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation failed", "errors": errs})
	}
	if id == actorID && (req.Role != "admin" || (req.IsActive != nil && !*req.IsActive)) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "You cannot deactivate or demote your own account"})
	}
	if req.Role == "doctor" && (strings.TrimSpace(req.Specialization) == "" || strings.TrimSpace(req.LicenseNumber) == "") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Doctor specialty and license number are required"})
	}

	var user models.User
	var doctor models.Doctor
	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&user, "id = ?", id).Error; err != nil {
			return err
		}
		user.Email, user.Prefix, user.FullName, user.Phone, user.Role = req.Email, req.Prefix, req.FullName, req.Phone, req.Role
		if req.IsActive != nil {
			user.IsActive = *req.IsActive
		}
		if strings.TrimSpace(req.Password) != "" {
			hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			if err != nil {
				return err
			}
			user.PasswordHash = string(hash)
		}
		if err := tx.Save(&user).Error; err != nil {
			return err
		}

		profileErr := tx.Preload("Schedules").Where("user_id = ?", user.ID).First(&doctor).Error
		if req.Role != "doctor" {
			if profileErr == nil {
				if err := tx.Model(&doctor).Update("is_active", false).Error; err != nil {
					return err
				}
			}
			return nil
		}
		if profileErr != nil && profileErr != gorm.ErrRecordNotFound {
			return profileErr
		}
		fee := req.ConsultationFee
		if fee == 0 {
			fee = 500
		}
		if profileErr == gorm.ErrRecordNotFound {
			doctor = models.Doctor{UserID: &user.ID, ConsultationFee: fee}
		}
		doctor.Prefix, doctor.FullName, doctor.Specialization = user.Prefix, user.FullName, req.Specialization
		doctor.LicenseNumber, doctor.Phone, doctor.ConsultationFee = req.LicenseNumber, req.Phone, fee
		doctor.Notes, doctor.IsActive = req.DoctorNotes, user.IsActive
		if err := tx.Save(&doctor).Error; err != nil {
			return err
		}
		if err := tx.Where("doctor_id = ?", doctor.ID).Delete(&models.DoctorSchedule{}).Error; err != nil {
			return err
		}
		for _, schedule := range req.Schedules {
			if err := tx.Create(&models.DoctorSchedule{DoctorID: doctor.ID, DayOfWeek: schedule.DayOfWeek, StartTime: schedule.StartTime, EndTime: schedule.EndTime, SlotDurationMin: schedule.SlotDurationMin}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err == gorm.ErrRecordNotFound {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Staff member not found"})
	}
	if err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "error", "message": "Could not update staff; email or doctor license may already exist"})
	}

	result := dto.StaffResponse{ID: user.ID, Email: user.Email, Prefix: user.Prefix, FullName: user.FullName, Phone: user.Phone, Role: user.Role, IsActive: user.IsActive}
	if user.Role == "doctor" {
		if err := h.db.Preload("Schedules").First(&doctor, "user_id = ?", user.ID).Error; err == nil {
			result.Doctor = doctorToResponse(doctor)
		}
	}
	return c.JSON(fiber.Map{"status": "success", "data": result})
}

func doctorToResponse(doctor models.Doctor) *dto.DoctorResponse {
	schedules := make([]dto.ScheduleResponse, 0, len(doctor.Schedules))
	for _, schedule := range doctor.Schedules {
		schedules = append(schedules, dto.ScheduleResponse{ID: schedule.ID, DayOfWeek: schedule.DayOfWeek, StartTime: schedule.StartTime, EndTime: schedule.EndTime, SlotDurationMin: schedule.SlotDurationMin})
	}
	return &dto.DoctorResponse{ID: doctor.ID, UserID: doctor.UserID, Prefix: doctor.Prefix, FullName: doctor.FullName, Specialization: doctor.Specialization, LicenseNumber: doctor.LicenseNumber, Phone: doctor.Phone, ConsultationFee: doctor.ConsultationFee, IsActive: doctor.IsActive, Notes: doctor.Notes, Schedules: schedules}
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
				Phone:        req.Phone,
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
	if err := h.db.Preload("User").Find(&doctors).Error; err != nil {
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
			"status":  "error",
			"message": "Invalid doctor ID",
		})
	}

	var req dto.DoctorScheduleRequest
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
			"status":  "error",
			"message": "Failed to add schedule",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data":   schedule,
	})
}
