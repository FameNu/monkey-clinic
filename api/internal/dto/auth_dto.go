package dto

import "github.com/google/uuid"

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type UserResponse struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	Prefix   string    `json:"prefix"`
	FullName string    `json:"full_name"`
	Phone    string    `json:"phone"`
	Role     string    `json:"role"`
	IsActive bool      `json:"is_active"`
}

type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}
