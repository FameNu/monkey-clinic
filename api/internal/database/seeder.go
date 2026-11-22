package database

import (
	"fmt"
	"log"
	"time"

	"github.com/FameNu/clinic-management-system/api/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedAll(db *gorm.DB) error {
	return db.Transaction(seedAll)
}

func seedAll(db *gorm.DB) error {
	var userCount int64
	if err := db.Model(&models.User{}).Count(&userCount).Error; err != nil {
		return fmt.Errorf("count users before seeding: %w", err)
	}
	if userCount > 0 {
		log.Println("Database already seeded. Skipping...")
		return nil
	}

	log.Println("Seeding initial clinic data...")

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash seed password: %w", err)
	}
	pw := string(hashedPassword)

	// 1. Seed Users (Admin, Receptionist, Doctors)
	admin := models.User{
		Email:        "admin@monkeyclinic.com",
		PasswordHash: pw,
		Prefix:       "คุณ",
		FullName:     "ผู้ดูแลระบบ คลินิก",
		Role:         "admin",
		IsActive:     true,
	}
	reception := models.User{
		Email:        "reception@monkeyclinic.com",
		PasswordHash: pw,
		Prefix:       "คุณ",
		FullName:     "สมหญิง ต้อนรับดี",
		Role:         "receptionist",
		IsActive:     true,
	}
	docUser1 := models.User{
		Email:        "dr.somchai@monkeyclinic.com",
		PasswordHash: pw,
		Prefix:       "นพ.",
		FullName:     "สมชาย ใจดี",
		Role:         "doctor",
		IsActive:     true,
	}
	docUser2 := models.User{
		Email:        "dr.wanida@monkeyclinic.com",
		PasswordHash: pw,
		Prefix:       "พญ.",
		FullName:     "วนิดา รักษาดี",
		Role:         "doctor",
		IsActive:     true,
	}
	for _, user := range []*models.User{&admin, &reception, &docUser1, &docUser2} {
		if err := db.Create(user).Error; err != nil {
			return fmt.Errorf("seed user %s: %w", user.Email, err)
		}
	}

	// 2. Seed Doctors Profile
	doctor1 := models.Doctor{
		UserID:         &docUser1.ID,
		Prefix:         docUser1.Prefix,
		FullName:       docUser1.FullName,
		Specialization: "อายุรกรรมทั่วไป (General Medicine)",
		LicenseNumber:  "ว.45120",
		Phone:          "081-111-2222",
	}
	doctor2 := models.Doctor{
		UserID:         &docUser2.ID,
		Prefix:         docUser2.Prefix,
		FullName:       docUser2.FullName,
		Specialization: "กุมารเวชกรรมและผิวหนัง (Pediatrics & Dermatology)",
		LicenseNumber:  "ว.48901",
		Phone:          "081-333-4444",
	}
	if err := db.Create(&doctor1).Error; err != nil {
		return fmt.Errorf("seed doctor %s: %w", doctor1.FullName, err)
	}
	if err := db.Create(&doctor2).Error; err != nil {
		return fmt.Errorf("seed doctor %s: %w", doctor2.FullName, err)
	}

	// 3. Seed Medications
	meds := []models.Medication{
		{
			Code:          "MED-001",
			Name:          "Amoxicillin 500mg",
			GenericName:   "Amoxicillin",
			Unit:          "แคปซูล",
			PricePerUnit:  5.00,
			StockQuantity: 200,
			MinStockAlert: 30,
		},
		{
			Code:          "MED-002",
			Name:          "Amoxil Forte 500mg",
			GenericName:   "Amoxicillin", // Generic เดียวกับ MED-001 ใช้เทสเช็กแพ้ยาข้ามยี่ห้อ
			Unit:          "แคปซูล",
			PricePerUnit:  8.50,
			StockQuantity: 120,
			MinStockAlert: 20,
		},
		{
			Code:          "MED-003",
			Name:          "Sara 500mg",
			GenericName:   "Paracetamol",
			Unit:          "เม็ด",
			PricePerUnit:  2.00,
			StockQuantity: 500,
			MinStockAlert: 50,
		},
		{
			Code:          "MED-004",
			Name:          "Brufen 400mg",
			GenericName:   "Ibuprofen",
			Unit:          "เม็ด",
			PricePerUnit:  6.00,
			StockQuantity: 150,
			MinStockAlert: 25,
		},
		{
			Code:          "MED-005",
			Name:          "Cetirizine 10mg",
			GenericName:   "Cetirizine",
			Unit:          "เม็ด",
			PricePerUnit:  4.00,
			StockQuantity: 180,
			MinStockAlert: 20,
		},
		{
			Code:          "MED-006",
			Name:          "Ventolin Inhaler",
			GenericName:   "Salbutamol",
			Unit:          "หลอดพ่น",
			PricePerUnit:  280.00,
			StockQuantity: 4, // for testing low stock alert
			MinStockAlert: 10,
		},
	}
	if err := db.Create(&meds).Error; err != nil {
		return fmt.Errorf("seed medications: %w", err)
	}

	// 4. Seed Patients
	dob1, _ := time.Parse("2006-01-02", "1990-05-15")
	dob2, _ := time.Parse("2006-01-02", "1995-11-20")
	dob3, _ := time.Parse("2006-01-02", "2018-03-10")

	patient1 := models.Patient{
		HNCode:          "HN-2026-0001",
		Prefix:          "นาย",
		FullName:        "กิตติศักดิ์ มั่นคง",
		Phone:           "089-123-4567",
		Gender:          "male",
		DateOfBirth:     &dob1,
		BloodType:       "O",
		ChronicDiseases: "ความดันโลหิตสูง",
	}
	patient2 := models.Patient{
		HNCode:          "HN-2026-0002",
		Prefix:          "นางสาว",
		FullName:        "พิมพ์ชนก สุขสันต์",
		Phone:           "086-987-6543",
		Gender:          "female",
		DateOfBirth:     &dob2,
		BloodType:       "A",
		ChronicDiseases: "ภูมิแพ้อากาศ",
	}
	patient3 := models.Patient{
		HNCode:          "HN-2026-0003",
		Prefix:          "ด.ช.",
		FullName:        "ธนกฤต เก่งกล้า",
		Phone:           "082-555-8888",
		Gender:          "male",
		DateOfBirth:     &dob3,
		BloodType:       "B",
		ChronicDiseases: "",
	}
	if err := db.Create(&patient1).Error; err != nil {
		return fmt.Errorf("seed patient %s: %w", patient1.FullName, err)
	}
	if err := db.Create(&patient2).Error; err != nil {
		return fmt.Errorf("seed patient %s: %w", patient2.FullName, err)
	}
	if err := db.Create(&patient3).Error; err != nil {
		return fmt.Errorf("seed patient %s: %w", patient3.FullName, err)
	}

	// 5. Seed Patient Allergies
	allergies := []models.PatientAllergy{
		{
			PatientID:    patient1.ID,
			MedicationID: meds[0].ID, // allergy to Amoxicillin
			Severity:     "severe",
			ReactionNote: "ผื่นลมพิษขึ้นทั่วตัว แน่นหน้าอก หายใจติดขัด",
		},
		{
			PatientID:    patient2.ID,
			MedicationID: meds[3].ID, // allergy to Brufen (Ibuprofen)
			Severity:     "moderate",
			ReactionNote: "ตาบวมและคลื่นไส้อาเจียน",
		},
	}
	if err := db.Create(&allergies).Error; err != nil {
		return fmt.Errorf("seed patient allergies: %w", err)
	}

	// 6. Seed Appointments (cover with status checked_in, scheduled, completed)
	today := time.Now().Format("2006-01-02")

	appt1 := models.Appointment{
		PatientID:       patient1.ID,
		DoctorID:        doctor1.ID,
		AppointmentDate: today,
		StartTime:       "09:30",
		EndTime:         "10:00",
		Status:          "checked_in",
		Reason:          "มีไข้ เจ็บคอ ไอมีเสมหะมา 2 วัน (พร้อมเข้าห้องตรวจ)",
		CreatedBy:       reception.ID,
	}
	appt2 := models.Appointment{
		PatientID:       patient2.ID,
		DoctorID:        doctor2.ID,
		AppointmentDate: today,
		StartTime:       "10:30",
		EndTime:         "11:00",
		Status:          "scheduled",
		Reason:          "ผื่นคันตามแขนและลำตัว",
		CreatedBy:       reception.ID,
	}
	appt3 := models.Appointment{
		PatientID:       patient3.ID,
		DoctorID:        doctor2.ID,
		AppointmentDate: today,
		StartTime:       "08:30",
		EndTime:         "09:00",
		Status:          "completed",
		Reason:          "ตรวจติดตามอาการไข้หวัด",
		CreatedBy:       reception.ID,
	}
	if err := db.Create(&appt1).Error; err != nil {
		return fmt.Errorf("seed first appointment: %w", err)
	}
	if err := db.Create(&appt2).Error; err != nil {
		return fmt.Errorf("seed second appointment: %w", err)
	}
	if err := db.Create(&appt3).Error; err != nil {
		return fmt.Errorf("seed third appointment: %w", err)
	}

	// 7. Seed Completed Medical Record & Unpaid Invoice
	record := models.MedicalRecord{
		AppointmentID:  appt3.ID,
		Diagnosis:      "Acute Upper Respiratory Infection (ไข้หวัดทั่วไป)",
		Symptoms:       "มีน้ำมูกใส ไข้ต่ำๆ 37.8 องศา",
		TreatmentNotes: "เช็ดตัวลดไข้ ดื่มน้ำพักผ่อนให้เพียงพอ",
	}
	if err := db.Create(&record).Error; err != nil {
		return fmt.Errorf("seed medical record: %w", err)
	}

	rxItem := models.PrescriptionItem{
		MedicalRecordID:   record.ID,
		MedicationID:      meds[2].ID, // Sara 500mg
		Quantity:          10,
		DosageInstruction: "รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมง เมื่อมีไข้",
		UnitPrice:         meds[2].PricePerUnit,
	}
	if err := db.Create(&rxItem).Error; err != nil {
		return fmt.Errorf("seed prescription item: %w", err)
	}

	log.Println("Seed completed successfully! Default password: password123")
	return nil
}
