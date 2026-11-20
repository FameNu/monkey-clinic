package utils

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

type ValidationErrorResponse struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func ValidateStruct(s interface{}) []ValidationErrorResponse {
	var errors []ValidationErrorResponse

	err := validate.Struct(s)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, ValidationErrorResponse{
				Field:   strings.ToLower(err.Field()),
				Message: formatValidationMessage(err),
			})
		}
	}

	return errors
}

func formatValidationMessage(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Invalid email format"
	case "min":
		return fmt.Sprintf("Must be at least %s characters", err.Param())
	case "oneof":
		return fmt.Sprintf("Must be one of: %s", err.Param())
	default:
		return fmt.Sprintf("Failed validation on '%s'", err.Tag())
	}
}
