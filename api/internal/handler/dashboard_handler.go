package handler

import (
	"time"

	"github.com/FameNu/clinic-management-system/api/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

func (h *DashboardHandler) GetSummary(c *fiber.Ctx) error {
	today := time.Now().Format("2006-01-02")

	var totalPatients int64
	h.db.Model(&models.Patient{}).Count(&totalPatients)

	var todayAppointments int64
	h.db.Model(&models.Appointment{}).Where("appointment_date = ? AND status != ?", today, "cancelled").Count(&todayAppointments)

	var completedToday int64
	h.db.Model(&models.Appointment{}).Where("appointment_date = ? AND status = ?", today, "completed").Count(&completedToday)

	var lowStockCount int64
	h.db.Model(&models.Medication{}).Where("stock_quantity <= min_stock_alert").Count(&lowStockCount)

	var todayRevenue float64
	h.db.Model(&models.Invoice{}).
		Where("payment_status = ? AND DATE(paid_at) = ?", "paid", today).
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&todayRevenue)

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"date":               today,
			"total_patients":     totalPatients,
			"today_appointments": todayAppointments,
			"completed_today":    completedToday,
			"low_stock_meds":     lowStockCount,
			"today_revenue":      todayRevenue,
		},
	})
}
