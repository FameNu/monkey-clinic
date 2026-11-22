package config

import (
	"fmt"
	"log"
	"os"

	clinicdatabase "github.com/FameNu/clinic-management-system/api/internal/database"
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
		err = clinicdatabase.SeedAll(db)
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
