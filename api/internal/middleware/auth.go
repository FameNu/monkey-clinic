package middleware

import (
	"errors"
	"log"
	"os"
	"strings"

	"github.com/FameNu/clinic-management-system/api/internal/models"
	"github.com/FameNu/clinic-management-system/api/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func AuthRequired(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := strings.TrimSpace(c.Get("Authorization"))
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Missing Authorization header",
			})
		}

		parts := strings.Fields(authHeader)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Invalid Authorization header format",
			})
		}

		tokenString := strings.TrimSpace(parts[1])
		if len(tokenString) >= 2 {
			first, last := tokenString[0], tokenString[len(tokenString)-1]
			if (first == '"' && last == '"') || (first == '\'' && last == '\'') {
				tokenString = tokenString[1 : len(tokenString)-1]
			}
		}

		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			response := fiber.Map{
				"status":  "error",
				"message": "Invalid or expired token",
			}
			if strings.EqualFold(strings.TrimSpace(os.Getenv("APP_ENV")), "development") {
				log.Printf("JWT validation failed: %v", err)
				response["reason"] = err.Error()
			}
			return c.Status(fiber.StatusUnauthorized).JSON(response)
		}

		var user struct {
			ID       uuid.UUID
			Role     string
			IsActive bool
		}
		err = db.Model(&models.User{}).Select("id, role, is_active").Where("id = ?", claims.UserID).Take(&user).Error
		if errors.Is(err, gorm.ErrRecordNotFound) || (err == nil && !user.IsActive) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Account is inactive or no longer exists"})
		}
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to verify account"})
		}
		c.Locals("user_id", user.ID)
		c.Locals("role", user.Role)

		return c.Next()
	}
}

func RequireRoles(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, ok := c.Locals("role").(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Unauthorized",
			})
		}

		for _, role := range allowedRoles {
			if userRole == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Forbidden: insufficient permissions",
		})
	}
}
