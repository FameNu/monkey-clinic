package main

import (
	"log"
	"os"

	"github.com/FameNu/clinic-management-system/api/internal/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)



func main() {
	_ = godotenv.Load("../.env")
	_ = godotenv.Load(".env")

	db := config.ConnectDB()

	app := fiber.New(fiber.Config{
		AppName: "Clinic Management System",
	})

	app.Use(logger.New())
	app.Use(cors.New())

	app.Get("/api/v1/health", func(c *fiber.Ctx) error {
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(app.Listen(":" + port))
}