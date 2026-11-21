package dto

import "github.com/google/uuid"

type CreateInvoiceRequest struct {
	AppointmentID uuid.UUID `json:"appointment_id" validate:"required"`
	Discount      float64   `json:"discount" validate:"min=0"`
}

type PayInvoiceRequest struct {
	PaymentMethod string `json:"payment_method" validate:"required,oneof=cash promptpay credit_card"`
}
