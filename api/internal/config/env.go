package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

// LoadEnv loads the nearest project .env file without overriding process vars.
func LoadEnv() {
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
