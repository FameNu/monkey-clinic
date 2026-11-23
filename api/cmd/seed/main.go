package main

import (
	"log"
	"os"
	"strings"

	"github.com/FameNu/clinic-management-system/api/internal/config"
	"github.com/FameNu/clinic-management-system/api/internal/database"
)

func main() {
	config.LoadEnv()
	env := strings.ToLower(strings.TrimSpace(os.Getenv("APP_ENV")))
	if env != "development" && env != "local" {
		log.Fatal("refusing to seed outside APP_ENV=development or APP_ENV=local")
	}

	db := config.ConnectDB()
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("get database connection: %v", err)
	}
	defer func() {
		if err := sqlDB.Close(); err != nil {
			log.Printf("close database: %v", err)
		}
	}()

	// OpenDB seeds automatically in development. The explicit call covers local.
	if env == "local" {
		if err := database.SeedAll(db); err != nil {
			log.Fatalf("seed database: %v", err)
		}
	}
	log.Println("Monkey Clinic seed data is ready")
}
