package server

import (
	"github.com/FameNu/clinic-management-system/api/internal/handler"
	"github.com/FameNu/clinic-management-system/api/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/gorm"
)

func New(db *gorm.DB) *fiber.App {
	app := fiber.New(fiber.Config{AppName: "Clinic Management System"})
	app.Use(logger.New())
	app.Use(cors.New())

	api := app.Group("/api/v1")
	api.Get("/health", func(c *fiber.Ctx) error {
		sqlDB, err := db.DB()
		if err != nil || sqlDB.Ping() != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"status":   "error",
				"message":  "Database connection failed",
				"database": "disconnected",
			})
		}
		return c.JSON(fiber.Map{
			"status":   "success",
			"message":  "API is running",
			"database": "connected",
		})
	})

	authHandler := handler.NewAuthHandler(db)
	auth := api.Group("/auth")
	auth.Post("/login", authHandler.Login)
	auth.Get("/me", middleware.AuthRequired(), authHandler.GetMe)

	protected := api.Group("", middleware.AuthRequired())
	staffHandler := handler.NewStaffHandler(db)
	patientHandler := handler.NewPatientHandler(db)
	appointmentHandler := handler.NewAppointmentHandler(db)
	medicationHandler := handler.NewMedicationHandler(db)
	clinicalHandler := handler.NewClinicalHandler(db)
	invoiceHandler := handler.NewInvoiceHandler(db)
	dashboardHandler := handler.NewDashboardHandler(db)

	protected.Post("/users", middleware.RequireRoles("admin"), staffHandler.CreateUser)
	protected.Post("/doctors", middleware.RequireRoles("admin"), staffHandler.CreateDoctor)
	protected.Get("/doctors", staffHandler.GetDoctors)
	protected.Post("/doctors/:id/schedule", middleware.RequireRoles("admin"), staffHandler.AddDoctorSchedule)

	protected.Post("/patients", middleware.RequireRoles("admin", "receptionist"), patientHandler.CreatePatient)
	protected.Get("/patients", middleware.RequireRoles("admin", "receptionist"), patientHandler.GetPatients)
	protected.Get("/patients/:id", middleware.RequireRoles("admin", "receptionist"), patientHandler.GetPatientByID)
	protected.Post("/patients/:id/allergies", middleware.RequireRoles("admin", "doctor", "receptionist"), patientHandler.AddPatientAllergy)

	protected.Post("/appointments", middleware.RequireRoles("admin", "receptionist"), appointmentHandler.CreateAppointment)
	protected.Get("/appointments", appointmentHandler.GetAppointments)
	protected.Get("/appointments/:id", appointmentHandler.GetAppointmentByID)
	protected.Patch("/appointments/:id/status", middleware.RequireRoles("admin", "doctor", "receptionist"), appointmentHandler.UpdateStatus)

	protected.Get("/medications", medicationHandler.GetMedications)
	protected.Post("/medications", middleware.RequireRoles("admin"), medicationHandler.CreateMedication)
	protected.Patch("/medications/:id/restock", middleware.RequireRoles("admin", "receptionist"), medicationHandler.RestockMedication)

	protected.Post("/medical-records", middleware.RequireRoles("admin", "doctor"), clinicalHandler.CreateMedicalRecord)
	protected.Get("/patients/:id/history", clinicalHandler.GetPatientHistory)

	protected.Get("/invoices", invoiceHandler.GetInvoices)
	protected.Post("/invoices", middleware.RequireRoles("admin", "receptionist"), invoiceHandler.CreateInvoice)
	protected.Patch("/invoices/:id/pay", middleware.RequireRoles("admin", "receptionist"), invoiceHandler.PayInvoice)

	protected.Get("/dashboard/summary", dashboardHandler.GetSummary)

	return app
}
