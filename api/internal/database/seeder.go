package database

import (
	"fmt"
	"log"
	"time"

	"github.com/FameNu/clinic-management-system/api/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const seedPassword = "Password123!"

// SeedAll adds or refreshes the deterministic Monkey Clinic development data.
// Natural keys and stable IDs make it safe to run from the API, the seed command,
// or repeatedly against the same database.
func SeedAll(db *gorm.DB) error {
	location, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return fmt.Errorf("load Asia/Bangkok timezone: %w", err)
	}
	localDB := db.Session(&gorm.Session{NowFunc: func() time.Time { return time.Now().In(location) }})
	return localDB.Transaction(func(tx *gorm.DB) error {
		return seedAll(tx, location)
	})
}

func seedAll(db *gorm.DB, location *time.Location) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(seedPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash local seed password: %w", err)
	}
	passwordHash := string(hash)
	log.Println("Seeding Monkey Clinic sample data (Asia/Bangkok)...")

	users := []models.User{
		{BaseModel: models.BaseModel{ID: seedID("10000000", 1)}, Email: "admin@monkeyclinic.com", PasswordHash: passwordHash, Prefix: "คุณ", FullName: "กานดา ผู้ดูแลคลินิก", Phone: "081-200-1001", Role: "admin", IsActive: true},
		{BaseModel: models.BaseModel{ID: seedID("10000000", 2)}, Email: "reception@monkeyclinic.com", PasswordHash: passwordHash, Prefix: "คุณ", FullName: "สมหญิง ต้อนรับดี", Phone: "081-200-1002", Role: "receptionist", IsActive: true},
		{BaseModel: models.BaseModel{ID: seedID("10000000", 3)}, Email: "reception2@monkeyclinic.com", PasswordHash: passwordHash, Prefix: "คุณ", FullName: "ปรียา ใจบริการ", Phone: "081-200-1003", Role: "receptionist", IsActive: false},
		{BaseModel: models.BaseModel{ID: seedID("10000000", 4)}, Email: "dr.somchai@monkeyclinic.com", PasswordHash: passwordHash, Prefix: "นพ.", FullName: "สมชาย ใจดี", Phone: "081-200-1004", Role: "doctor", IsActive: true},
		{BaseModel: models.BaseModel{ID: seedID("10000000", 5)}, Email: "dr.wanida@monkeyclinic.com", PasswordHash: passwordHash, Prefix: "พญ.", FullName: "วนิดา รักษาดี", Phone: "081-200-1005", Role: "doctor", IsActive: true},
		{BaseModel: models.BaseModel{ID: seedID("10000000", 6)}, Email: "dr.pimchanok@monkeyclinic.com", PasswordHash: passwordHash, Prefix: "พญ.", FullName: "พิมพ์ชนก ผิวใส", Phone: "081-200-1006", Role: "doctor", IsActive: false},
	}
	for i := range users {
		user := &users[i]
		attrs := map[string]interface{}{
			"password_hash": user.PasswordHash, "prefix": user.Prefix, "full_name": user.FullName,
			"phone": user.Phone, "role": user.Role, "is_active": user.IsActive,
		}
		if err := seedFirstOrCreate(db, user, "email = ?", []interface{}{user.Email}, attrs); err != nil {
			return fmt.Errorf("seed user %s: %w", user.Email, err)
		}
	}

	doctors := []models.Doctor{
		{BaseModel: models.BaseModel{ID: seedID("20000000", 1)}, UserID: &users[3].ID, Prefix: users[3].Prefix, FullName: users[3].FullName, Specialization: "เวชปฏิบัติทั่วไป (General Practice)", LicenseNumber: "ว.45120", Phone: users[3].Phone, ConsultationFee: 700, Notes: "ตรวจโรคทั่วไปและโรคเรื้อรัง", IsActive: true},
		{BaseModel: models.BaseModel{ID: seedID("20000000", 2)}, UserID: &users[4].ID, Prefix: users[4].Prefix, FullName: users[4].FullName, Specialization: "ศัลยศาสตร์ออร์โธปิดิกส์ (Orthopedics)", LicenseNumber: "ว.48901", Phone: users[4].Phone, ConsultationFee: 850, Notes: "ตรวจอาการปวดข้อและกล้ามเนื้อ", IsActive: true},
		{BaseModel: models.BaseModel{ID: seedID("20000000", 3)}, UserID: &users[5].ID, Prefix: users[5].Prefix, FullName: users[5].FullName, Specialization: "ผิวหนัง (Dermatology)", LicenseNumber: "ว.51234", Phone: users[5].Phone, ConsultationFee: 900, Notes: "แพทย์ผิวหนัง สถานะบัญชีปิดใช้งานสำหรับทดสอบ", IsActive: false},
	}
	for i := range doctors {
		doctor := &doctors[i]
		attrs := map[string]interface{}{
			"user_id": doctor.UserID, "prefix": doctor.Prefix, "full_name": doctor.FullName,
			"specialization": doctor.Specialization, "phone": doctor.Phone,
			"consultation_fee": doctor.ConsultationFee, "notes": doctor.Notes, "is_active": doctor.IsActive,
		}
		if err := seedFirstOrCreate(db, doctor, "license_number = ?", []interface{}{doctor.LicenseNumber}, attrs); err != nil {
			return fmt.Errorf("seed doctor %s: %w", doctor.LicenseNumber, err)
		}
	}

	schedules := []struct {
		doctorIndex int
		day         int
		start       string
		end         string
		slot        int
	}{
		{0, 1, "09:00", "16:00", 30}, {0, 3, "09:00", "16:00", 30}, {0, 5, "09:00", "12:00", 30},
		{1, 2, "10:00", "18:00", 30}, {1, 4, "10:00", "18:00", 30},
		{2, 6, "09:00", "15:00", 45},
	}
	for i, item := range schedules {
		schedule := models.DoctorSchedule{BaseModel: models.BaseModel{ID: seedID("21000000", i+1)}, DoctorID: doctors[item.doctorIndex].ID, DayOfWeek: item.day, StartTime: item.start, EndTime: item.end, SlotDurationMin: item.slot}
		attrs := map[string]interface{}{"start_time": schedule.StartTime, "end_time": schedule.EndTime, "slot_duration_min": schedule.SlotDurationMin}
		if err := seedFirstOrCreate(db, &schedule, "doctor_id = ? AND day_of_week = ?", []interface{}{schedule.DoctorID, schedule.DayOfWeek}, attrs); err != nil {
			return fmt.Errorf("seed doctor schedule %d: %w", i+1, err)
		}
	}

	medications := []models.Medication{
		{BaseModel: models.BaseModel{ID: seedID("30000000", 1)}, Code: "MED-001", Name: "Amoxicillin 500mg", GenericName: "Amoxicillin", Category: "Antibiotic", AllergyWarnings: "ห้ามใช้ในผู้ที่แพ้ Penicillin หรือ Amoxicillin", Unit: "แคปซูล", PricePerUnit: 5, StockQuantity: 180, MinStockAlert: 30, Note: "รับประทานหลังอาหารตามแพทย์สั่ง และใช้ยาให้ครบ"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 2)}, Code: "MED-002", Name: "Amoxil Forte 500mg", GenericName: "Amoxicillin", Category: "Antibiotic", AllergyWarnings: "ห้ามใช้ในผู้ที่แพ้ Penicillin หรือ Amoxicillin", Unit: "แคปซูล", PricePerUnit: 8.5, StockQuantity: 6, MinStockAlert: 10, Note: "ชื่อการค้าต่างกันแต่มีตัวยา Amoxicillin เหมือน MED-001"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 3)}, Code: "MED-003", Name: "Sara 500mg", GenericName: "Paracetamol", Category: "Analgesic", Unit: "เม็ด", PricePerUnit: 2, StockQuantity: 450, MinStockAlert: 50, Note: "รับประทานครั้งละ 1 เม็ดเมื่อมีไข้หรือปวด ห่างกันอย่างน้อย 4 ชั่วโมง"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 4)}, Code: "MED-004", Name: "Brufen 400mg", GenericName: "Ibuprofen", Category: "Analgesic / NSAID", AllergyWarnings: "หลีกเลี่ยงหากแพ้ Ibuprofen, Aspirin หรือยาในกลุ่ม NSAIDs", Unit: "เม็ด", PricePerUnit: 6, StockQuantity: 110, MinStockAlert: 25, Note: "รับประทานหลังอาหาร ไม่ใช้ร่วมกับ NSAIDs ตัวอื่น"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 5)}, Code: "MED-005", Name: "Cetirizine 10mg", GenericName: "Cetirizine", Category: "Antihistamine", Unit: "เม็ด", PricePerUnit: 4, StockQuantity: 120, MinStockAlert: 20, Note: "รับประทานวันละ 1 ครั้ง ยาอาจทำให้ง่วง"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 6)}, Code: "MED-006", Name: "Ventolin Inhaler", GenericName: "Salbutamol", Category: "Respiratory", Unit: "หลอด", PricePerUnit: 280, StockQuantity: 4, MinStockAlert: 10, Note: "ใช้สูดพ่นเมื่อมีอาการหอบตามคำแนะนำแพทย์"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 7)}, Code: "MED-007", Name: "Omeprazole 20mg", GenericName: "Omeprazole", Category: "Gastrointestinal", Unit: "แคปซูล", PricePerUnit: 5.5, StockQuantity: 95, MinStockAlert: 20, Note: "รับประทานก่อนอาหารเช้า"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 8)}, Code: "MED-008", Name: "Hydrocortisone 1% Cream", GenericName: "Hydrocortisone", Category: "Dermatological", AllergyWarnings: "หยุดใช้หากมีผื่นหรือระคายเคืองจากยา", Unit: "หลอด", PricePerUnit: 45, StockQuantity: 35, MinStockAlert: 8, Note: "ทาบางๆ บริเวณผื่น วันละ 1-2 ครั้ง หลีกเลี่ยงรอบดวงตา"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 9)}, Code: "MED-009", Name: "ORS Oral Rehydration Salts", GenericName: "Oral Rehydration Salts", Category: "Gastrointestinal", Unit: "ซอง", PricePerUnit: 8, StockQuantity: 80, MinStockAlert: 15, Note: "ละลายน้ำสะอาดตามปริมาณที่ระบุบนซอง"},
		{BaseModel: models.BaseModel{ID: seedID("30000000", 10)}, Code: "MED-010", Name: "Diclofenac 25mg", GenericName: "Diclofenac", Category: "Analgesic / NSAID", AllergyWarnings: "ห้ามใช้ในผู้ที่แพ้ Diclofenac, Ibuprofen, Aspirin หรือยา NSAIDs", Unit: "เม็ด", PricePerUnit: 7, StockQuantity: 5, MinStockAlert: 12, Note: "รับประทานหลังอาหาร ใช้ตามระยะเวลาที่แพทย์กำหนด"},
	}
	for i := range medications {
		medication := &medications[i]
		attrs := map[string]interface{}{
			"name": medication.Name, "generic_name": medication.GenericName, "category": medication.Category,
			"allergy_warnings": medication.AllergyWarnings, "unit": medication.Unit,
			"price_per_unit": medication.PricePerUnit, "stock_quantity": medication.StockQuantity,
			"min_stock_alert": medication.MinStockAlert, "note": medication.Note,
		}
		if err := seedFirstOrCreate(db, medication, "code = ?", []interface{}{medication.Code}, attrs); err != nil {
			return fmt.Errorf("seed medication %s: %w", medication.Code, err)
		}
	}

	patients := []models.Patient{
		{BaseModel: models.BaseModel{ID: seedID("40000000", 1)}, HNCode: "HN-2026-0001", Prefix: "นาย", FullName: "กิตติศักดิ์ มั่นคง", NationalID: stringPtr("1101700000010"), Phone: "089-123-4501", Address: "เขตบางรัก กรุงเทพมหานคร", EmergencyContact: "กมล มั่นคง 089-123-4502", Gender: "male", BloodType: "O", ChronicDiseases: "ความดันโลหิตสูง"},
		{BaseModel: models.BaseModel{ID: seedID("40000000", 2)}, HNCode: "HN-2026-0002", Prefix: "นางสาว", FullName: "พิมพ์ชนก สุขสันต์", NationalID: stringPtr("1103700000020"), Phone: "086-987-4502", Address: "เขตจตุจักร กรุงเทพมหานคร", EmergencyContact: "สุรีย์ สุขสันต์ 086-987-4503", Gender: "female", BloodType: "A", ChronicDiseases: "ภูมิแพ้อากาศ"},
		{BaseModel: models.BaseModel{ID: seedID("40000000", 3)}, HNCode: "HN-2026-0003", Prefix: "ด.ช.", FullName: "ธนกฤต เก่งกล้า", NationalID: stringPtr("1102700000037"), Phone: "082-555-8803", Address: "อำเภอเมืองนนทบุรี จังหวัดนนทบุรี", EmergencyContact: "ธนกร เก่งกล้า 082-555-8804", Gender: "male", BloodType: "B"},
		{BaseModel: models.BaseModel{ID: seedID("40000000", 4)}, HNCode: "HN-2026-0004", Prefix: "นาง", FullName: "อรทัย ใจเย็น", NationalID: stringPtr("1101500000041"), Phone: "089-456-7804", Address: "เขตพระโขนง กรุงเทพมหานคร", EmergencyContact: "วิเชียร ใจเย็น 089-456-7805", Gender: "female", BloodType: "AB", ChronicDiseases: "เบาหวานชนิดที่ 2"},
		{BaseModel: models.BaseModel{ID: seedID("40000000", 5)}, HNCode: "HN-2026-0005", Prefix: "นาย", FullName: "ณัฐวุฒิ แสงทอง", NationalID: stringPtr("1101600000051"), Phone: "081-777-1205", Address: "เขตบางนา กรุงเทพมหานคร", EmergencyContact: "มาลี แสงทอง 081-777-1206", Gender: "male", BloodType: "A"},
		{BaseModel: models.BaseModel{ID: seedID("40000000", 6)}, HNCode: "HN-2026-0006", Prefix: "นางสาว", FullName: "ชลธิชา พูนทรัพย์", NationalID: stringPtr("1102700000061"), Phone: "084-223-3406", Address: "อำเภอปากเกร็ด จังหวัดนนทบุรี", EmergencyContact: "ธิดา พูนทรัพย์ 084-223-3407", Gender: "female", BloodType: "O", ChronicDiseases: "กรดไหลย้อน"},
		{BaseModel: models.BaseModel{ID: seedID("40000000", 7)}, HNCode: "HN-2026-0007", Prefix: "นาย", FullName: "ปกรณ์ วัฒนชัย", NationalID: stringPtr("1103700000071"), Phone: "086-112-2307", Address: "เขตดินแดง กรุงเทพมหานคร", EmergencyContact: "วราภรณ์ วัฒนชัย 086-112-2308", Gender: "male", BloodType: "B"},
		{BaseModel: models.BaseModel{ID: seedID("40000000", 8)}, HNCode: "HN-2026-0008", Prefix: "นางสาว", FullName: "ณิชารีย์ พรหมรักษา", NationalID: stringPtr("1101800000089"), Phone: "092-321-4508", Address: "เขตลาดกระบัง กรุงเทพมหานคร", EmergencyContact: "สุพจน์ พรหมรักษา 092-321-4509", Gender: "female", BloodType: "A", ChronicDiseases: "ไมเกรน"},
	}
	for i := range patients {
		patient := &patients[i]
		date, err := time.ParseInLocation("2006-01-02", patientDOB(i), location)
		if err != nil {
			return fmt.Errorf("parse seeded patient date of birth: %w", err)
		}
		patient.DateOfBirth = &date
		attrs := map[string]interface{}{
			"prefix": patient.Prefix, "full_name": patient.FullName, "national_id": patient.NationalID,
			"phone": patient.Phone, "address": patient.Address, "emergency_contact": patient.EmergencyContact,
			"date_of_birth": patient.DateOfBirth, "gender": patient.Gender, "blood_type": patient.BloodType,
			"chronic_diseases": patient.ChronicDiseases,
		}
		if err := seedFirstOrCreate(db, patient, "hn_code = ?", []interface{}{patient.HNCode}, attrs); err != nil {
			return fmt.Errorf("seed patient %s: %w", patient.HNCode, err)
		}
	}

	allergies := []models.PatientAllergy{
		{BaseModel: models.BaseModel{ID: seedID("41000000", 1)}, PatientID: patients[0].ID, MedicationID: medications[0].ID, Severity: "severe", ReactionNote: "เคยมีผื่นลมพิษและหายใจติดขัดหลังได้รับยา Penicillin"},
		{BaseModel: models.BaseModel{ID: seedID("41000000", 2)}, PatientID: patients[1].ID, MedicationID: medications[3].ID, Severity: "moderate", ReactionNote: "ตาบวมและคลื่นไส้หลังรับประทาน Ibuprofen"},
		{BaseModel: models.BaseModel{ID: seedID("41000000", 3)}, PatientID: patients[6].ID, MedicationID: medications[1].ID, Severity: "mild", ReactionNote: "มีผื่นคันหลังใช้ยาที่มี Amoxicillin"},
	}
	for i := range allergies {
		allergy := &allergies[i]
		attrs := map[string]interface{}{"severity": allergy.Severity, "reaction_note": allergy.ReactionNote}
		if err := seedFirstOrCreate(db, allergy, "patient_id = ? AND medication_id = ?", []interface{}{allergy.PatientID, allergy.MedicationID}, attrs); err != nil {
			return fmt.Errorf("seed patient allergy %d: %w", i+1, err)
		}
	}

	today := time.Now().In(location)
	appointmentSeeds := []struct {
		id, patient, doctor, dateOffset int
		start, end, status, reason      string
	}{
		{1, 0, 0, -1, "09:00", "09:30", "completed", "ติดตามความดันโลหิตและมีอาการปวดศีรษะ"},
		{2, 1, 1, -1, "10:00", "10:30", "completed", "ผื่นคันบริเวณแขนและลำตัว"},
		{3, 2, 0, -1, "11:00", "11:30", "cancelled", "ผู้ปกครองขอเลื่อนนัดตรวจสุขภาพเด็ก"},
		{4, 3, 1, -1, "13:00", "13:30", "no_show", "ติดตามระดับน้ำตาลในเลือด"},
		{5, 4, 0, 0, "09:15", "09:45", "completed", "มีไข้ต่ำและปวดเมื่อยตามตัว"},
		{6, 5, 1, 0, "10:15", "10:45", "checked_in", "แสบร้อนกลางอกและเรอเปรี้ยว พร้อมเข้าห้องตรวจ"},
		{7, 6, 0, 0, "11:15", "11:45", "scheduled", "ขอคำปรึกษาเรื่องผื่นแพ้ยา"},
		{8, 7, 1, 0, "14:00", "14:30", "scheduled", "ปวดศีรษะไมเกรน"},
		{9, 0, 0, 1, "09:30", "10:00", "scheduled", "ติดตามผลการรักษา"},
		{10, 3, 1, 1, "10:30", "11:00", "scheduled", "นัดติดตามโรคประจำตัว"},
		{11, 7, 2, -3, "15:00", "15:45", "completed", "ผื่นแห้งและคันบริเวณแขน"},
		{12, 5, 1, -5, "16:00", "16:30", "completed", "ติดตามอาการกรดไหลย้อน"},
		{13, 6, 0, -7, "12:00", "12:30", "cancelled", "ผู้ป่วยขอยกเลิกนัด"},
	}
	appointments := make(map[int]models.Appointment, len(appointmentSeeds))
	for _, seed := range appointmentSeeds {
		appointmentDate := today.AddDate(0, 0, seed.dateOffset).Format("2006-01-02")
		appointment := models.Appointment{
			BaseModel: models.BaseModel{ID: seedID("50000000", seed.id)},
			PatientID: patients[seed.patient].ID, DoctorID: doctors[seed.doctor].ID,
			AppointmentDate: appointmentDate, StartTime: seed.start, EndTime: seed.end,
			Status: seed.status, Reason: seed.reason, CreatedBy: users[1].ID,
		}
		appointment, err := seedAppointment(db, appointment)
		if err != nil {
			return fmt.Errorf("seed appointment %d: %w", seed.id, err)
		}
		appointments[seed.id] = appointment
	}

	recordSeeds := []struct {
		appointmentID int
		diagnosis     string
		symptoms      string
		notes         string
	}{
		{1, "Essential hypertension with tension headache", "ปวดศีรษะเล็กน้อย ความดันสูงกว่าค่าปกติ", "รับประทานยาความดันต่อเนื่องและวัดความดันที่บ้าน"},
		{2, "Allergic dermatitis", "ผื่นแดงคันบริเวณแขน", "งดเกาและหลีกเลี่ยงสิ่งกระตุ้น"},
		{5, "Acute viral syndrome", "ไข้ต่ำ ปวดเมื่อย 1 วัน", "พักผ่อน ดื่มน้ำมาก หากไข้สูงให้กลับมาตรวจ"},
		{11, "Mild atopic dermatitis", "ผิวแห้งและคันบริเวณแขน", "ทาครีมบางๆ และใช้มอยส์เจอไรเซอร์"},
		{12, "Gastroesophageal reflux disease", "แสบร้อนกลางอกหลังรับประทานอาหาร", "หลีกเลี่ยงอาหารมื้อดึกและติดตามอาการ"},
	}
	records := make(map[int]models.MedicalRecord, len(recordSeeds))
	for _, seed := range recordSeeds {
		appointment := appointments[seed.appointmentID]
		record := models.MedicalRecord{BaseModel: models.BaseModel{ID: seedID("60000000", seed.appointmentID)}, AppointmentID: appointment.ID, Diagnosis: seed.diagnosis, Symptoms: seed.symptoms, TreatmentNotes: seed.notes}
		attrs := map[string]interface{}{"diagnosis": record.Diagnosis, "symptoms": record.Symptoms, "treatment_notes": record.TreatmentNotes}
		if err := seedFirstOrCreate(db, &record, "appointment_id = ?", []interface{}{record.AppointmentID}, attrs); err != nil {
			return fmt.Errorf("seed medical record %d: %w", seed.appointmentID, err)
		}
		records[seed.appointmentID] = record
	}

	prescriptionSeeds := []struct {
		appointmentID, medicationIndex, quantity int
		instruction                              string
	}{
		{1, 2, 10, "รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการปวด"},
		{1, 4, 5, "รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้งก่อนนอน"},
		{2, 7, 1, "ทาบางๆ บริเวณผื่น วันละ 2 ครั้ง"},
		{5, 2, 8, "รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีไข้"},
		{11, 7, 1, "ทาบางๆ บริเวณผื่น วันละ 1-2 ครั้ง"},
		{12, 6, 14, "รับประทานครั้งละ 1 แคปซูลก่อนอาหารเช้า"},
	}
	prescriptions := make(map[int][]models.PrescriptionItem)
	for i, seed := range prescriptionSeeds {
		record := records[seed.appointmentID]
		medication := medications[seed.medicationIndex]
		item := models.PrescriptionItem{
			BaseModel:       models.BaseModel{ID: seedID("61000000", i+1)},
			MedicalRecordID: record.ID, MedicationID: medication.ID, Quantity: seed.quantity,
			DosageInstruction: seed.instruction, UnitPrice: medication.PricePerUnit,
		}
		attrs := map[string]interface{}{"quantity": item.Quantity, "dosage_instruction": item.DosageInstruction, "unit_price": item.UnitPrice}
		if err := seedFirstOrCreate(db, &item, "medical_record_id = ? AND medication_id = ?", []interface{}{item.MedicalRecordID, item.MedicationID}, attrs); err != nil {
			return fmt.Errorf("seed prescription item %d: %w", i+1, err)
		}
		prescriptions[seed.appointmentID] = append(prescriptions[seed.appointmentID], item)
	}

	invoiceSeeds := []struct {
		appointmentID int
		paid          bool
		discount      float64
		method        string
	}{
		{1, true, 0, "promptpay"}, {2, true, 50, "cash"}, {5, false, 0, ""},
		{11, true, 0, "credit_card"}, {12, false, 25, ""},
	}
	for i, seed := range invoiceSeeds {
		appointment := appointments[seed.appointmentID]
		var medicationTotal float64
		for _, item := range prescriptions[seed.appointmentID] {
			medicationTotal += float64(item.Quantity) * item.UnitPrice
		}
		invoice := models.Invoice{
			BaseModel:     models.BaseModel{ID: seedID("70000000", i+1)},
			InvoiceNumber: fmt.Sprintf("MC-SEED-%04d", i+1), AppointmentID: appointment.ID,
			DoctorFee:       doctors[appointmentDoctorIndex(seed.appointmentID)].ConsultationFee,
			MedicationTotal: medicationTotal, Discount: seed.discount,
			TotalAmount:   doctors[appointmentDoctorIndex(seed.appointmentID)].ConsultationFee + medicationTotal - seed.discount,
			PaymentStatus: "unpaid",
		}
		if seed.paid {
			invoice.PaymentStatus = "paid"
			invoice.PaymentMethod = seed.method
			paidDate, err := time.ParseInLocation("2006-01-02", appointment.AppointmentDate, location)
			if err != nil {
				return fmt.Errorf("parse paid invoice date: %w", err)
			}
			paidAt := time.Date(paidDate.Year(), paidDate.Month(), paidDate.Day(), 11, 30, 0, 0, location)
			invoice.PaidAt = &paidAt
		}
		attrs := map[string]interface{}{
			"invoice_number": invoice.InvoiceNumber, "doctor_fee": invoice.DoctorFee,
			"medication_total": invoice.MedicationTotal, "discount": invoice.Discount,
			"total_amount": invoice.TotalAmount, "payment_status": invoice.PaymentStatus,
			"payment_method": invoice.PaymentMethod, "paid_at": invoice.PaidAt,
		}
		if err := seedFirstOrCreate(db, &invoice, "appointment_id = ?", []interface{}{invoice.AppointmentID}, attrs); err != nil {
			return fmt.Errorf("seed invoice %s: %w", invoice.InvoiceNumber, err)
		}
	}

	log.Printf("Seeded 6 staff accounts, 3 doctors, 10 medications, 8 patients, 13 appointments, 5 medical records, and 5 invoices. Test password: %s", seedPassword)
	return nil
}

func seedFirstOrCreate(db *gorm.DB, dest interface{}, query string, args []interface{}, attrs map[string]interface{}) error {
	return db.Where(query, args...).Assign(attrs).FirstOrCreate(dest).Error
}

func seedAppointment(db *gorm.DB, appointment models.Appointment) (models.Appointment, error) {
	attrs := map[string]interface{}{
		"patient_id": appointment.PatientID, "doctor_id": appointment.DoctorID,
		"appointment_date": appointment.AppointmentDate, "start_time": appointment.StartTime,
		"end_time": appointment.EndTime, "status": appointment.Status,
		"reason": appointment.Reason, "created_by": appointment.CreatedBy,
	}
	var existing models.Appointment
	err := db.First(&existing, "id = ?", appointment.ID).Error
	if err == gorm.ErrRecordNotFound {
		err = db.Where("patient_id = ? AND doctor_id = ? AND appointment_date = ? AND start_time = ?", appointment.PatientID, appointment.DoctorID, appointment.AppointmentDate, appointment.StartTime).First(&existing).Error
	}
	if err == gorm.ErrRecordNotFound {
		if err := db.Create(&appointment).Error; err != nil {
			return models.Appointment{}, err
		}
		return appointment, nil
	}
	if err != nil {
		return models.Appointment{}, err
	}
	if err := db.Model(&existing).Updates(attrs).Error; err != nil {
		return models.Appointment{}, err
	}
	return existing, nil
}

func seedID(prefix string, number int) uuid.UUID {
	return uuid.MustParse(fmt.Sprintf("%s-0000-4000-8000-%012d", prefix, number))
}

func stringPtr(value string) *string { return &value }

func patientDOB(index int) string {
	return []string{"1987-04-12", "1994-09-25", "2017-02-08", "1978-06-19", "1990-01-31", "1985-11-06", "2001-03-17", "1998-12-02"}[index]
}

func appointmentDoctorIndex(appointmentID int) int {
	for _, appointment := range []struct{ id, doctor int }{{1, 0}, {2, 1}, {5, 0}, {11, 2}, {12, 1}} {
		if appointment.id == appointmentID {
			return appointment.doctor
		}
	}
	return 0
}
