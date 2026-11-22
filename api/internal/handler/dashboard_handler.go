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
	location, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Clinic timezone is unavailable"})
	}
	date := c.Query("date")
	if date == "" {
		date = time.Now().In(location).Format("2006-01-02")
	}
	if _, err := time.ParseInLocation("2006-01-02", date, location); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "date must use YYYY-MM-DD"})
	}

	var totalPatients int64
	if err := h.db.Model(&models.Patient{}).Count(&totalPatients).Error; err != nil {
		return dashboardQueryError(c)
	}
	var appointmentCount int64
	if err := h.db.Model(&models.Appointment{}).Where("appointment_date = ?", date).Count(&appointmentCount).Error; err != nil {
		return dashboardQueryError(c)
	}
	statusCounts := map[string]int64{}
	rows, err := h.db.Model(&models.Appointment{}).
		Select("status, COUNT(*) AS count").Where("appointment_date = ?", date).
		Group("status").Rows()
	if err != nil {
		return dashboardQueryError(c)
	}
	for rows.Next() {
		var status string
		var count int64
		if err := rows.Scan(&status, &count); err != nil {
			_ = rows.Close()
			return dashboardQueryError(c)
		}
		statusCounts[status] = count
	}
	if err := rows.Close(); err != nil {
		return dashboardQueryError(c)
	}

	var visitedPatients int64
	if err := h.db.Model(&models.Appointment{}).Where("appointment_date = ? AND status = ?", date, "completed").Distinct("patient_id").Count(&visitedPatients).Error; err != nil {
		return dashboardQueryError(c)
	}
	var lowStockCount int64
	if err := h.db.Model(&models.Medication{}).Where("stock_quantity <= min_stock_alert").Count(&lowStockCount).Error; err != nil {
		return dashboardQueryError(c)
	}

	type revenueTotals struct {
		Consultation float64 `gorm:"column:consultation"`
		Medication   float64 `gorm:"column:medication"`
		Billed       float64 `gorm:"column:billed"`
		Paid         float64 `gorm:"column:paid"`
		Unpaid       float64 `gorm:"column:unpaid"`
	}
	var revenue revenueTotals
	err = h.db.Table("invoices").Joins("JOIN appointments ON appointments.id = invoices.appointment_id").
		Where("appointments.appointment_date = ?", date).
		Select(`COALESCE(SUM(invoices.doctor_fee), 0) AS consultation,
			COALESCE(SUM(invoices.medication_total), 0) AS medication,
			COALESCE(SUM(invoices.total_amount), 0) AS billed,
			COALESCE(SUM(CASE WHEN invoices.payment_status = 'paid' THEN invoices.total_amount ELSE 0 END), 0) AS paid,
			COALESCE(SUM(CASE WHEN invoices.payment_status = 'unpaid' THEN invoices.total_amount ELSE 0 END), 0) AS unpaid`).
		Scan(&revenue).Error
	if err != nil {
		return dashboardQueryError(c)
	}
	var paidRevenue float64
	if err := h.db.Model(&models.Invoice{}).
		Where("payment_status = ? AND DATE(paid_at AT TIME ZONE 'Asia/Bangkok') = ?", "paid", date).
		Select("COALESCE(SUM(invoices.total_amount), 0)").Scan(&paidRevenue).Error; err != nil {
		return dashboardQueryError(c)
	}

	var appointments []models.Appointment
	if err := h.db.Preload("Patient").Preload("Doctor").Preload("MedicalRecord").Preload("Invoice").
		Where("appointment_date = ?", date).Order("start_time asc").Find(&appointments).Error; err != nil {
		return dashboardQueryError(c)
	}
	visits := make([]fiber.Map, 0, len(appointments))
	for _, appointment := range appointments {
		billedAmount := float64(0)
		paymentStatus := "unbilled"
		if appointment.Invoice != nil {
			billedAmount = appointment.Invoice.TotalAmount
			paymentStatus = appointment.Invoice.PaymentStatus
		}
		diagnosis := ""
		if appointment.MedicalRecord != nil {
			diagnosis = appointment.MedicalRecord.Diagnosis
		}
		visits = append(visits, fiber.Map{
			"appointment_id":   appointment.ID,
			"appointment_time": appointment.StartTime,
			"patient_id":       appointment.PatientID,
			"patient_name":     appointment.Patient.Prefix + appointment.Patient.FullName,
			"hn_code":          appointment.Patient.HNCode,
			"doctor_name":      appointment.Doctor.Prefix + appointment.Doctor.FullName,
			"diagnosis":        diagnosis,
			"visit_status":     appointment.Status,
			"billed_amount":    billedAmount,
			"payment_status":   paymentStatus,
		})
	}

	completed := statusCounts["completed"]
	waiting := statusCounts["scheduled"] + statusCounts["checked_in"] + statusCounts["in_progress"]
	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"date":               date,
			"total_patients":     totalPatients,
			"today_appointments": appointmentCount,
			"completed_today":    completed,
			"low_stock_meds":     lowStockCount,
			"today_revenue":      paidRevenue,
			"patients_visited":   visitedPatients,
			"appointment_statuses": fiber.Map{
				"completed":   completed,
				"waiting":     waiting,
				"scheduled":   statusCounts["scheduled"],
				"checked_in":  statusCounts["checked_in"],
				"in_progress": statusCounts["in_progress"],
				"cancelled":   statusCounts["cancelled"],
				"no_show":     statusCounts["no_show"],
			},
			"revenue": fiber.Map{
				"consultation_fees": revenue.Consultation,
				"medication_sales":  revenue.Medication,
				"billed_total":      revenue.Billed,
				"paid_total":        revenue.Paid,
				"unpaid_total":      revenue.Unpaid,
				"collected_on_date": paidRevenue,
			},
			"visits": visits,
		},
	})
}

func dashboardQueryError(c *fiber.Ctx) error {
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to load dashboard summary"})
}
