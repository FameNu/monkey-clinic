package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/FameNu/clinic-management-system/api/internal/config"
	"github.com/FameNu/clinic-management-system/api/internal/handler"
	"github.com/FameNu/clinic-management-system/api/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	loadEnv()
	if strings.TrimSpace(os.Getenv("JWT_SECRET")) == "" {
		log.Fatal("JWT_SECRET must be set before starting the API")
	}

	db := config.ConnectDB()

	app := fiber.New(fiber.Config{
		AppName: "Clinic Management System",
	})

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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(app.Listen(":" + port))
}

func loadEnv() {
	for _, candidate := range []string{".env", "../.env", "../../.env", "../../../.env"} {
		path, err := filepath.Abs(candidate)
		if err != nil {
			continue
		}
		if _, err := os.Stat(path); err != nil {
			continue
		}
		if err := godotenv.Load(path); err != nil {
			log.Printf("WARN: could not load %s: %v", path, err)
		}
		return
	}
	log.Println("INFO: no .env file found; using process environment")
}
