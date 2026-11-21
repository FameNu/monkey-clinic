package main

import (
	"log"
	"os"
	"strings"

	"github.com/FameNu/clinic-management-system/api/internal/config"
	"github.com/FameNu/clinic-management-system/api/internal/server"
)

func main() {
	config.LoadEnv()
	if strings.TrimSpace(os.Getenv("JWT_SECRET")) == "" {
		log.Fatal("JWT_SECRET must be set before starting the API")
	}

	db := config.ConnectDB()
	app := server.New(db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(app.Listen(":" + port))
}
