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
	db, err := OpenDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	return db
}

func OpenDB() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		host := getEnv("POSTGRES_HOST", "localhost")
		port := getEnv("POSTGRES_PORT", "5432")
		user := getEnv("POSTGRES_USER", "postgres")
		password := getEnv("POSTGRES_PASSWORD", "password")
		dbname := getEnv("DB_NAME", getEnv("POSTGRES_DB", "clinic"))

		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Bangkok", host, port, user, password, dbname)
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
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
		closeDB(db)
		return nil, fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	appEnv := getEnv("APP_ENV", "development")
	if appEnv == "development" {
		err = seedDevData(db)
	} else if appEnv == "production" {
		err = bootstrapProdAdmin(db)
	}
	if err != nil {
		closeDB(db)
		return nil, err
	}

	return db, nil
}

func closeDB(db *gorm.DB) {
	sqlDB, err := db.DB()
	if err == nil {
		_ = sqlDB.Close()
	}
}

func seedDevData(db *gorm.DB) error {
	var userCount int64
	if err := db.Model(&models.User{}).Count(&userCount).Error; err != nil {
		return fmt.Errorf("failed to count users: %w", err)
	}
	if userCount == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin1234"), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash development admin password: %w", err)
		}
		admin := models.User{
			Email:        "admin@clinic.com",
			PasswordHash: string(hashedPassword),
			Prefix:       "นาย",
			FullName:     "Clinic Administrator",
			Role:         "admin",
			IsActive:     true,
		}
		if err := db.Create(&admin).Error; err != nil {
			return fmt.Errorf("failed to seed development admin: %w", err)
		}
		log.Println("[DEV] Seeded default admin: admin@clinic.com / admin1234")
	}

	var medCount int64
	if err := db.Model(&models.Medication{}).Count(&medCount).Error; err != nil {
		return fmt.Errorf("failed to count medications: %w", err)
	}
	if medCount == 0 {
		meds := []models.Medication{
			{Code: "MED-001", Name: "Paracetamol 500mg", GenericName: "Paracetamol", Unit: "เม็ด", PricePerUnit: 2.00, StockQuantity: 500, MinStockAlert: 50},
			{Code: "MED-002", Name: "Amoxicillin 500mg", GenericName: "Amoxicillin", Unit: "แคปซูล", PricePerUnit: 8.00, StockQuantity: 200, MinStockAlert: 30},
			{Code: "MED-003", Name: "Ibuprofen 400mg", GenericName: "Ibuprofen", Unit: "เม็ด", PricePerUnit: 5.00, StockQuantity: 150, MinStockAlert: 20},
		}
		if err := db.Create(&meds).Error; err != nil {
			return fmt.Errorf("failed to seed development medications: %w", err)
		}
		log.Println("[DEV] Seeded initial medications")
	}
	return nil
}

func bootstrapProdAdmin(db *gorm.DB) error {
	var adminCount int64
	if err := db.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount).Error; err != nil {
		return fmt.Errorf("failed to count administrators: %w", err)
	}
	if adminCount > 0 {
		return nil // Admin already exists, no need to bootstrap
	}

	email := os.Getenv("INITIAL_ADMIN_EMAIL")
	password := os.Getenv("INITIAL_ADMIN_PASSWORD")
	prefix := getEnv("INITIAL_ADMIN_PREFIX", "นาย")
	fullName := getEnv("INITIAL_ADMIN_NAME", "System Administrator")

	if email == "" || password == "" {
		log.Println("WARN: No admin found and INITIAL_ADMIN_EMAIL/PASSWORD not set in production")
		return nil
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash initial admin password: %w", err)
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
		return fmt.Errorf("failed to bootstrap production admin: %w", err)
	}
	log.Printf("Bootstrapped production admin: %s", email)
	return nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return defaultValue
}
