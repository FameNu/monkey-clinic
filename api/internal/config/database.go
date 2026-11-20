package config

import (
	"fmt"
	"log"
	"os"

	"github.com/FameNu/clinic-management-system/api/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		host := getEnv("POSTGRES_HOST", "localhost")
		port := getEnv("POSTGRES_PORT", "5432")
		user := getEnv("POSTGRES_USER", "postgres")
		password := getEnv("POSTGRES_PASSWORD", "password")
		dbname := getEnv("POSTGRES_DB", "clinic")

		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Bangkok", host, port, user, password, dbname)
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`).Error; err != nil {
		log.Printf("WARN: Could not ensure uuid-ossp extension: %v", err)
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Doctor{},
		&models.DoctorSchedule{},
		&models.Patient{},
		&models.Medication{},
		&models.PatientAllergy{},
		&models.Appointment{},
		&models.MedicalRecord{},
		&models.PrescriptionItem{},
		&models.Invoice{},
	)

	if err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}

	appEnv := getEnv("APP_ENV", "development")
	if appEnv == "development" {
		seedDevData(db)
	} else if appEnv == "production" {
		bootstrapProdAdmin(db)
	}

	return db
}

func seedDevData(db *gorm.DB) {
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin1234"), bcrypt.DefaultCost)
		admin := models.User{
			Email:        "admin@clinic.com",
			PasswordHash: string(hashedPassword),
			Prefix:       "นาย",
			FullName:     "Clinic Administrator",
			Role:         "admin",
			IsActive:     true,
		}
		db.Create(&admin)
		log.Println("[DEV] Seeded default admin: admin@clinic.com / admin1234")
	}

	var medCount int64
	db.Model(&models.Medication{}).Count(&medCount)
	if medCount == 0 {
		meds := []models.Medication{
			{Code: "MED-001", Name: "Paracetamol 500mg", GenericName: "Paracetamol", Unit: "เม็ด", PricePerUnit: 2.00, StockQuantity: 500, MinStockAlert: 50},
			{Code: "MED-002", Name: "Amoxicillin 500mg", GenericName: "Amoxicillin", Unit: "แคปซูล", PricePerUnit: 8.00, StockQuantity: 200, MinStockAlert: 30},
			{Code: "MED-003", Name: "Ibuprofen 400mg", GenericName: "Ibuprofen", Unit: "เม็ด", PricePerUnit: 5.00, StockQuantity: 150, MinStockAlert: 20},
		}
		db.Create(&meds)
		log.Println("[DEV] Seeded initial medications")
	}
}

func bootstrapProdAdmin(db *gorm.DB) {
	var adminCount int64
	db.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount)
	if adminCount > 0 {
		return // Admin already exists, no need to bootstrap
	}

	email := os.Getenv("INITIAL_ADMIN_EMAIL")
	password := os.Getenv("INITIAL_ADMIN_PASSWORD")
	prefix := getEnv("INITIAL_ADMIN_PREFIX", "นาย")
	fullName := getEnv("INITIAL_ADMIN_NAME", "System Administrator")

	if email == "" || password == "" {
		log.Println("WARN: No admin found and INITIAL_ADMIN_EMAIL/PASSWORD not set in production")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash initial admin password:", err)
	}

	admin := models.User{
		Email:        email,
		PasswordHash: string(hashedPassword),
		Prefix:       prefix,
		FullName:     fullName,
		Role:         "admin",
		IsActive:     true,
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Fatal("Failed to bootstrap production admin:", err)
	}
	log.Printf("Bootstrapped production admin: %s", email)
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return defaultValue
}
