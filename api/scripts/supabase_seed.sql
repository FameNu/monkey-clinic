-- Monkey Clinic development fixtures. All accounts use Password123!.
-- admin: admin@monkeyclinic.com
-- receptionist: reception@monkeyclinic.com (active), reception2@monkeyclinic.com (inactive)
-- doctor: dr.somchai@monkeyclinic.com, dr.wanida@monkeyclinic.com (active), dr.pimchanok@monkeyclinic.com (inactive)
-- Do not use these credentials in production.

BEGIN;
SET LOCAL TIME ZONE 'Asia/Bangkok';

-- bcrypt.DefaultCost hash of Password123! generated with golang.org/x/crypto/bcrypt.
INSERT INTO users (id, created_at, updated_at, email, password_hash, prefix, full_name, phone, role, is_active)
VALUES
('10000000-0000-4000-8000-000000000001', now(), now(), 'admin@monkeyclinic.com', '$2a$10$mugWA9EV2k1gZEWKytH7benzr6J74qkPJdX3jM.zziKnPmcs6hAXK', 'คุณ', 'กานดา ผู้ดูแลคลินิก', '081-200-1001', 'admin', true),
('10000000-0000-4000-8000-000000000002', now(), now(), 'reception@monkeyclinic.com', '$2a$10$mugWA9EV2k1gZEWKytH7benzr6J74qkPJdX3jM.zziKnPmcs6hAXK', 'คุณ', 'สมหญิง ต้อนรับดี', '081-200-1002', 'receptionist', true),
('10000000-0000-4000-8000-000000000003', now(), now(), 'reception2@monkeyclinic.com', '$2a$10$mugWA9EV2k1gZEWKytH7benzr6J74qkPJdX3jM.zziKnPmcs6hAXK', 'คุณ', 'ปรียา ใจบริการ', '081-200-1003', 'receptionist', false),
('10000000-0000-4000-8000-000000000004', now(), now(), 'dr.somchai@monkeyclinic.com', '$2a$10$mugWA9EV2k1gZEWKytH7benzr6J74qkPJdX3jM.zziKnPmcs6hAXK', 'นพ.', 'สมชาย ใจดี', '081-200-1004', 'doctor', true),
('10000000-0000-4000-8000-000000000005', now(), now(), 'dr.wanida@monkeyclinic.com', '$2a$10$mugWA9EV2k1gZEWKytH7benzr6J74qkPJdX3jM.zziKnPmcs6hAXK', 'พญ.', 'วนิดา รักษาดี', '081-200-1005', 'doctor', true),
('10000000-0000-4000-8000-000000000006', now(), now(), 'dr.pimchanok@monkeyclinic.com', '$2a$10$mugWA9EV2k1gZEWKytH7benzr6J74qkPJdX3jM.zziKnPmcs6hAXK', 'พญ.', 'พิมพ์ชนก ผิวใส', '081-200-1006', 'doctor', false)
ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, prefix=EXCLUDED.prefix,
 full_name=EXCLUDED.full_name, phone=EXCLUDED.phone, role=EXCLUDED.role, is_active=EXCLUDED.is_active, updated_at=now();

INSERT INTO doctors (id, created_at, updated_at, user_id, prefix, full_name, specialization, license_number, phone, consultation_fee, notes, is_active)
VALUES
('20000000-0000-4000-8000-000000000001', now(), now(), '10000000-0000-4000-8000-000000000004', 'นพ.', 'สมชาย ใจดี', 'เวชปฏิบัติทั่วไป (General Practice)', 'ว.45120', '081-200-1004', 700, 'ตรวจโรคทั่วไปและโรคเรื้อรัง', true),
('20000000-0000-4000-8000-000000000002', now(), now(), '10000000-0000-4000-8000-000000000005', 'พญ.', 'วนิดา รักษาดี', 'ศัลยศาสตร์ออร์โธปิดิกส์ (Orthopedics)', 'ว.48901', '081-200-1005', 850, 'ตรวจอาการปวดข้อและกล้ามเนื้อ', true),
('20000000-0000-4000-8000-000000000003', now(), now(), '10000000-0000-4000-8000-000000000006', 'พญ.', 'พิมพ์ชนก ผิวใส', 'ผิวหนัง (Dermatology)', 'ว.51234', '081-200-1006', 900, 'แพทย์ผิวหนัง สถานะบัญชีปิดใช้งานสำหรับทดสอบ', false)
ON CONFLICT (license_number) DO UPDATE SET user_id=EXCLUDED.user_id, prefix=EXCLUDED.prefix,
 full_name=EXCLUDED.full_name, specialization=EXCLUDED.specialization, phone=EXCLUDED.phone,
 consultation_fee=EXCLUDED.consultation_fee, notes=EXCLUDED.notes, is_active=EXCLUDED.is_active, updated_at=now();

INSERT INTO doctor_schedules (id, created_at, updated_at, doctor_id, day_of_week, start_time, end_time, slot_duration_min)
VALUES
('21000000-0000-4000-8000-000000000001', now(), now(), '20000000-0000-4000-8000-000000000001', 1, '09:00', '16:00', 30),
('21000000-0000-4000-8000-000000000002', now(), now(), '20000000-0000-4000-8000-000000000001', 3, '09:00', '16:00', 30),
('21000000-0000-4000-8000-000000000003', now(), now(), '20000000-0000-4000-8000-000000000001', 5, '09:00', '12:00', 30),
('21000000-0000-4000-8000-000000000004', now(), now(), '20000000-0000-4000-8000-000000000002', 2, '10:00', '18:00', 30),
('21000000-0000-4000-8000-000000000005', now(), now(), '20000000-0000-4000-8000-000000000002', 4, '10:00', '18:00', 30),
('21000000-0000-4000-8000-000000000006', now(), now(), '20000000-0000-4000-8000-000000000003', 6, '09:00', '15:00', 45)
ON CONFLICT (id) DO UPDATE SET doctor_id=EXCLUDED.doctor_id, day_of_week=EXCLUDED.day_of_week,
 start_time=EXCLUDED.start_time,
 end_time=EXCLUDED.end_time, slot_duration_min=EXCLUDED.slot_duration_min, updated_at=now();

INSERT INTO medications (id, created_at, updated_at, code, name, generic_name, category, allergy_warnings, unit, price_per_unit, stock_quantity, min_stock_alert, note)
VALUES
('30000000-0000-4000-8000-000000000001', now(), now(), 'MED-001', 'Amoxicillin 500mg', 'Amoxicillin', 'Antibiotic', 'ห้ามใช้ในผู้ที่แพ้ Penicillin หรือ Amoxicillin', 'แคปซูล', 5, 180, 30, 'รับประทานหลังอาหารตามแพทย์สั่ง และใช้ยาให้ครบ'),
('30000000-0000-4000-8000-000000000002', now(), now(), 'MED-002', 'Amoxil Forte 500mg', 'Amoxicillin', 'Antibiotic', 'ห้ามใช้ในผู้ที่แพ้ Penicillin หรือ Amoxicillin', 'แคปซูล', 8.5, 6, 10, 'ชื่อการค้าต่างกันแต่มีตัวยา Amoxicillin เหมือน MED-001'),
('30000000-0000-4000-8000-000000000003', now(), now(), 'MED-003', 'Sara 500mg', 'Paracetamol', 'Analgesic', '', 'เม็ด', 2, 450, 50, 'รับประทานครั้งละ 1 เม็ดเมื่อมีไข้หรือปวด ห่างกันอย่างน้อย 4 ชั่วโมง'),
('30000000-0000-4000-8000-000000000004', now(), now(), 'MED-004', 'Brufen 400mg', 'Ibuprofen', 'Analgesic / NSAID', 'หลีกเลี่ยงหากแพ้ Ibuprofen, Aspirin หรือยาในกลุ่ม NSAIDs', 'เม็ด', 6, 110, 25, 'รับประทานหลังอาหาร ไม่ใช้ร่วมกับ NSAIDs ตัวอื่น'),
('30000000-0000-4000-8000-000000000005', now(), now(), 'MED-005', 'Cetirizine 10mg', 'Cetirizine', 'Antihistamine', '', 'เม็ด', 4, 120, 20, 'รับประทานวันละ 1 ครั้ง ยาอาจทำให้ง่วง'),
('30000000-0000-4000-8000-000000000006', now(), now(), 'MED-006', 'Ventolin Inhaler', 'Salbutamol', 'Respiratory', '', 'หลอด', 280, 4, 10, 'ใช้สูดพ่นเมื่อมีอาการหอบตามคำแนะนำแพทย์'),
('30000000-0000-4000-8000-000000000007', now(), now(), 'MED-007', 'Omeprazole 20mg', 'Omeprazole', 'Gastrointestinal', '', 'แคปซูล', 5.5, 95, 20, 'รับประทานก่อนอาหารเช้า'),
('30000000-0000-4000-8000-000000000008', now(), now(), 'MED-008', 'Hydrocortisone 1% Cream', 'Hydrocortisone', 'Dermatological', 'หยุดใช้หากมีผื่นหรือระคายเคืองจากยา', 'หลอด', 45, 35, 8, 'ทาบางๆ บริเวณผื่น วันละ 1-2 ครั้ง หลีกเลี่ยงรอบดวงตา'),
('30000000-0000-4000-8000-000000000009', now(), now(), 'MED-009', 'ORS Oral Rehydration Salts', 'Oral Rehydration Salts', 'Gastrointestinal', '', 'ซอง', 8, 80, 15, 'ละลายน้ำสะอาดตามปริมาณที่ระบุบนซอง'),
('30000000-0000-4000-8000-000000000010', now(), now(), 'MED-010', 'Diclofenac 25mg', 'Diclofenac', 'Analgesic / NSAID', 'ห้ามใช้ในผู้ที่แพ้ Diclofenac, Ibuprofen, Aspirin หรือยา NSAIDs', 'เม็ด', 7, 5, 12, 'รับประทานหลังอาหาร ใช้ตามระยะเวลาที่แพทย์กำหนด')
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, generic_name=EXCLUDED.generic_name,
 category=EXCLUDED.category, allergy_warnings=EXCLUDED.allergy_warnings, unit=EXCLUDED.unit,
 price_per_unit=EXCLUDED.price_per_unit, stock_quantity=EXCLUDED.stock_quantity,
 min_stock_alert=EXCLUDED.min_stock_alert, note=EXCLUDED.note, updated_at=now();

INSERT INTO patients (id, created_at, updated_at, hn_code, prefix, full_name, national_id, phone, address, emergency_contact, date_of_birth, gender, blood_type, chronic_diseases)
VALUES
('40000000-0000-4000-8000-000000000001', now(), now(), 'HN-2026-0001', 'นาย', 'กิตติศักดิ์ มั่นคง', '1101700000010', '089-123-4501', 'เขตบางรัก กรุงเทพมหานคร', 'กมล มั่นคง 089-123-4502', '1987-04-12 00:00:00+07', 'male', 'O', 'ความดันโลหิตสูง'),
('40000000-0000-4000-8000-000000000002', now(), now(), 'HN-2026-0002', 'นางสาว', 'พิมพ์ชนก สุขสันต์', '1103700000020', '086-987-4502', 'เขตจตุจักร กรุงเทพมหานคร', 'สุรีย์ สุขสันต์ 086-987-4503', '1994-09-25 00:00:00+07', 'female', 'A', 'ภูมิแพ้อากาศ'),
('40000000-0000-4000-8000-000000000003', now(), now(), 'HN-2026-0003', 'ด.ช.', 'ธนกฤต เก่งกล้า', '1102700000037', '082-555-8803', 'อำเภอเมืองนนทบุรี จังหวัดนนทบุรี', 'ธนกร เก่งกล้า 082-555-8804', '2017-02-08 00:00:00+07', 'male', 'B', ''),
('40000000-0000-4000-8000-000000000004', now(), now(), 'HN-2026-0004', 'นาง', 'อรทัย ใจเย็น', '1101500000041', '089-456-7804', 'เขตพระโขนง กรุงเทพมหานคร', 'วิเชียร ใจเย็น 089-456-7805', '1978-06-19 00:00:00+07', 'female', 'AB', 'เบาหวานชนิดที่ 2'),
('40000000-0000-4000-8000-000000000005', now(), now(), 'HN-2026-0005', 'นาย', 'ณัฐวุฒิ แสงทอง', '1101600000051', '081-777-1205', 'เขตบางนา กรุงเทพมหานคร', 'มาลี แสงทอง 081-777-1206', '1990-01-31 00:00:00+07', 'male', 'A', ''),
('40000000-0000-4000-8000-000000000006', now(), now(), 'HN-2026-0006', 'นางสาว', 'ชลธิชา พูนทรัพย์', '1102700000061', '084-223-3406', 'อำเภอปากเกร็ด จังหวัดนนทบุรี', 'ธิดา พูนทรัพย์ 084-223-3407', '1985-11-06 00:00:00+07', 'female', 'O', 'กรดไหลย้อน'),
('40000000-0000-4000-8000-000000000007', now(), now(), 'HN-2026-0007', 'นาย', 'ปกรณ์ วัฒนชัย', '1103700000071', '086-112-2307', 'เขตดินแดง กรุงเทพมหานคร', 'วราภรณ์ วัฒนชัย 086-112-2308', '2001-03-17 00:00:00+07', 'male', 'B', ''),
('40000000-0000-4000-8000-000000000008', now(), now(), 'HN-2026-0008', 'นางสาว', 'ณิชารีย์ พรหมรักษา', '1101800000089', '092-321-4508', 'เขตลาดกระบัง กรุงเทพมหานคร', 'สุพจน์ พรหมรักษา 092-321-4509', '1998-12-02 00:00:00+07', 'female', 'A', 'ไมเกรน')
ON CONFLICT (hn_code) DO UPDATE SET prefix=EXCLUDED.prefix, full_name=EXCLUDED.full_name,
 national_id=EXCLUDED.national_id, phone=EXCLUDED.phone, address=EXCLUDED.address,
 emergency_contact=EXCLUDED.emergency_contact, date_of_birth=EXCLUDED.date_of_birth,
 gender=EXCLUDED.gender, blood_type=EXCLUDED.blood_type, chronic_diseases=EXCLUDED.chronic_diseases, updated_at=now();

INSERT INTO patient_allergies (id, created_at, updated_at, patient_id, medication_id, reaction_note, severity)
VALUES
('41000000-0000-4000-8000-000000000001', now(), now(), '40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'เคยมีผื่นลมพิษและหายใจติดขัดหลังได้รับยา Penicillin', 'severe'),
('41000000-0000-4000-8000-000000000002', now(), now(), '40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000004', 'ตาบวมและคลื่นไส้หลังรับประทาน Ibuprofen', 'moderate'),
('41000000-0000-4000-8000-000000000003', now(), now(), '40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000002', 'มีผื่นคันหลังใช้ยาที่มี Amoxicillin', 'mild')
ON CONFLICT (id) DO UPDATE SET patient_id=EXCLUDED.patient_id, medication_id=EXCLUDED.medication_id,
 reaction_note=EXCLUDED.reaction_note, severity=EXCLUDED.severity, updated_at=now();

INSERT INTO appointments (id, created_at, updated_at, patient_id, doctor_id, appointment_date, start_time, end_time, status, reason, created_by)
VALUES
('50000000-0000-4000-8000-000000000001', now(), now(), '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date - 1, 'YYYY-MM-DD'), '09:00', '09:30', 'completed', 'ติดตามความดันโลหิตและมีอาการปวดศีรษะ', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000002', now(), now(), '40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date - 1, 'YYYY-MM-DD'), '10:00', '10:30', 'completed', 'ผื่นคันบริเวณแขนและลำตัว', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000003', now(), now(), '40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date - 1, 'YYYY-MM-DD'), '11:00', '11:30', 'cancelled', 'ผู้ปกครองขอเลื่อนนัดตรวจสุขภาพเด็ก', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000004', now(), now(), '40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date - 1, 'YYYY-MM-DD'), '13:00', '13:30', 'no_show', 'ติดตามระดับน้ำตาลในเลือด', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000005', now(), now(), '40000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000001', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date, 'YYYY-MM-DD'), '09:15', '09:45', 'completed', 'มีไข้ต่ำและปวดเมื่อยตามตัว', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000006', now(), now(), '40000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date, 'YYYY-MM-DD'), '10:15', '10:45', 'checked_in', 'แสบร้อนกลางอกและเรอเปรี้ยว พร้อมเข้าห้องตรวจ', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000007', now(), now(), '40000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000001', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date, 'YYYY-MM-DD'), '11:15', '11:45', 'scheduled', 'ขอคำปรึกษาเรื่องผื่นแพ้ยา', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000008', now(), now(), '40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date, 'YYYY-MM-DD'), '14:00', '14:30', 'scheduled', 'ปวดศีรษะไมเกรน', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000009', now(), now(), '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date + 1, 'YYYY-MM-DD'), '09:30', '10:00', 'scheduled', 'ติดตามผลการรักษา', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000010', now(), now(), '40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date + 1, 'YYYY-MM-DD'), '10:30', '11:00', 'scheduled', 'นัดติดตามโรคประจำตัว', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000011', now(), now(), '40000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000003', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date - 3, 'YYYY-MM-DD'), '15:00', '15:45', 'completed', 'ผื่นแห้งและคันบริเวณแขน', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000012', now(), now(), '40000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date - 5, 'YYYY-MM-DD'), '16:00', '16:30', 'completed', 'ติดตามอาการกรดไหลย้อน', '10000000-0000-4000-8000-000000000002'),
('50000000-0000-4000-8000-000000000013', now(), now(), '40000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000001', to_char((now() AT TIME ZONE 'Asia/Bangkok')::date - 7, 'YYYY-MM-DD'), '12:00', '12:30', 'cancelled', 'ผู้ป่วยขอยกเลิกนัด', '10000000-0000-4000-8000-000000000002')
ON CONFLICT (id) DO UPDATE SET patient_id=EXCLUDED.patient_id, doctor_id=EXCLUDED.doctor_id,
 appointment_date=EXCLUDED.appointment_date, start_time=EXCLUDED.start_time, end_time=EXCLUDED.end_time,
 status=EXCLUDED.status, reason=EXCLUDED.reason, created_by=EXCLUDED.created_by, updated_at=now();

INSERT INTO medical_records (id, created_at, updated_at, appointment_id, diagnosis, symptoms, treatment_notes)
VALUES
('60000000-0000-4000-8000-000000000001', now(), now(), '50000000-0000-4000-8000-000000000001', 'Essential hypertension with tension headache', 'ปวดศีรษะเล็กน้อย ความดันสูงกว่าค่าปกติ', 'รับประทานยาความดันต่อเนื่องและวัดความดันที่บ้าน'),
('60000000-0000-4000-8000-000000000002', now(), now(), '50000000-0000-4000-8000-000000000002', 'Allergic dermatitis', 'ผื่นแดงคันบริเวณแขน', 'งดเกาและหลีกเลี่ยงสิ่งกระตุ้น'),
('60000000-0000-4000-8000-000000000005', now(), now(), '50000000-0000-4000-8000-000000000005', 'Acute viral syndrome', 'ไข้ต่ำ ปวดเมื่อย 1 วัน', 'พักผ่อน ดื่มน้ำมาก หากไข้สูงให้กลับมาตรวจ'),
('60000000-0000-4000-8000-000000000011', now(), now(), '50000000-0000-4000-8000-000000000011', 'Mild atopic dermatitis', 'ผิวแห้งและคันบริเวณแขน', 'ทาครีมบางๆ และใช้มอยส์เจอไรเซอร์'),
('60000000-0000-4000-8000-000000000012', now(), now(), '50000000-0000-4000-8000-000000000012', 'Gastroesophageal reflux disease', 'แสบร้อนกลางอกหลังรับประทานอาหาร', 'หลีกเลี่ยงอาหารมื้อดึกและติดตามอาการ')
ON CONFLICT (appointment_id) DO UPDATE SET diagnosis=EXCLUDED.diagnosis, symptoms=EXCLUDED.symptoms,
 treatment_notes=EXCLUDED.treatment_notes, updated_at=now();

INSERT INTO prescription_items (id, created_at, updated_at, medical_record_id, medication_id, quantity, dosage_instruction, unit_price)
VALUES
('61000000-0000-4000-8000-000000000001', now(), now(), '60000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', 10, 'รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการปวด', 2),
('61000000-0000-4000-8000-000000000002', now(), now(), '60000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000005', 5, 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้งก่อนนอน', 4),
('61000000-0000-4000-8000-000000000003', now(), now(), '60000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000008', 1, 'ทาบางๆ บริเวณผื่น วันละ 2 ครั้ง', 45),
('61000000-0000-4000-8000-000000000004', now(), now(), '60000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000003', 8, 'รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีไข้', 2),
('61000000-0000-4000-8000-000000000005', now(), now(), '60000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000008', 1, 'ทาบางๆ บริเวณผื่น วันละ 1-2 ครั้ง', 45),
('61000000-0000-4000-8000-000000000006', now(), now(), '60000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000007', 14, 'รับประทานครั้งละ 1 แคปซูลก่อนอาหารเช้า', 5.5)
ON CONFLICT (id) DO UPDATE SET medical_record_id=EXCLUDED.medical_record_id,
 medication_id=EXCLUDED.medication_id, quantity=EXCLUDED.quantity,
 dosage_instruction=EXCLUDED.dosage_instruction, unit_price=EXCLUDED.unit_price, updated_at=now();

INSERT INTO invoices (id, created_at, updated_at, invoice_number, appointment_id, doctor_fee, medication_total, discount, total_amount, payment_method, payment_status, paid_at)
VALUES
('70000000-0000-4000-8000-000000000001', now(), now(), 'MC-SEED-0001', '50000000-0000-4000-8000-000000000001', 700, 40, 0, 740, 'promptpay', 'paid', (((now() AT TIME ZONE 'Asia/Bangkok')::date - 1 + time '11:30') AT TIME ZONE 'Asia/Bangkok')),
('70000000-0000-4000-8000-000000000002', now(), now(), 'MC-SEED-0002', '50000000-0000-4000-8000-000000000002', 850, 45, 50, 845, 'cash', 'paid', (((now() AT TIME ZONE 'Asia/Bangkok')::date - 1 + time '11:30') AT TIME ZONE 'Asia/Bangkok')),
('70000000-0000-4000-8000-000000000003', now(), now(), 'MC-SEED-0003', '50000000-0000-4000-8000-000000000005', 700, 16, 0, 716, '', 'unpaid', NULL),
('70000000-0000-4000-8000-000000000004', now(), now(), 'MC-SEED-0004', '50000000-0000-4000-8000-000000000011', 900, 45, 0, 945, 'credit_card', 'paid', (((now() AT TIME ZONE 'Asia/Bangkok')::date - 3 + time '11:30') AT TIME ZONE 'Asia/Bangkok')),
('70000000-0000-4000-8000-000000000005', now(), now(), 'MC-SEED-0005', '50000000-0000-4000-8000-000000000012', 850, 77, 25, 902, '', 'unpaid', NULL)
ON CONFLICT (appointment_id) DO UPDATE SET invoice_number=EXCLUDED.invoice_number,
 doctor_fee=EXCLUDED.doctor_fee, medication_total=EXCLUDED.medication_total,
 discount=EXCLUDED.discount, total_amount=EXCLUDED.total_amount, payment_method=EXCLUDED.payment_method,
 payment_status=EXCLUDED.payment_status, paid_at=EXCLUDED.paid_at, updated_at=now();

COMMIT;
