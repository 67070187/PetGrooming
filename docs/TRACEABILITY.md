# Traceability Matrix

โยงแต่ละ Requirement ใน [PROJECT_SPEC.md](PROJECT_SPEC.md) ไปยังส่วนที่ทำ วิธีตรวจ และผลจริง อัปเดตล่าสุด 2026-11-13 จาก `main` บวกการเปลี่ยนแปลงชุดนี้

ผล test: `npm test` ใน `backend/` ผ่าน 93/93 (5 ไฟล์) · Jenkins build #1 และ #2 ผ่านทุก stage (2026-11-12, Jenkins บนเครื่อง ไม่ใช่ Course Container)

## Functional requirements

| ID | Acceptance criteria (ย่อ) | ส่วนที่ทำ | วิธีตรวจ | ผลจริง / สถานะ |
|---|---|---|---|---|
| FR-01 Register/login | สมัครได้แค่ลูกค้า เห็นเฉพาะข้อมูลตัวเอง staff เข้าตามสิทธิ์ | `POST /api/auth/register`, `POST /api/auth/login`, middleware `auth`/`staff`, หน้า AuthModal | `auth.test.js` (role จาก request ถูกเพิกเฉย, hash, 401 ข้อความเดียวกัน, ลูกค้าเข้า staff API ได้ 403), `staff.test.js` (ทุก endpoint ต้องมี staff token) | ผ่าน |
| FR-02 Pet profile | สร้างและดูสัตว์เลี้ยงของตัวเอง | `GET/POST /api/pets`, `DELETE /api/pets/:id`, แท็บ สัตว์เลี้ยงของฉัน | `pets.test.js` (ลบได้เฉพาะของตัวเองที่ไม่เคยจอง), เดโมขั้น 2 | ผ่าน |
| FR-03 Services | ทุกคนเห็นบริการที่เปิด staff จัดการได้ | `GET /api/services`, `/api/staff/services` (CRUD, เปิด/ปิด, ลบที่ไม่เคยถูกจอง), หน้า บริการ | `app.test.js` (สัญญา API), `staff.test.js` (สร้าง แก้ ชื่อซ้ำ 409 ลบ) | ผ่าน |
| FR-04 Availability | เวลาว่างคำนวณจากเวลาทำการ ระยะบริการ และการจองที่ยัง active | `GET /api/availability`, ตารางเวลาในหน้า จองคิว | `bookings.test.js` (ซ่อนเวลาที่ทับ, ต้องจบก่อน 18:00, คิวยกเลิกไม่บล็อก), `app.test.js` (input ผิด 400) | ผ่าน |
| FR-05 Booking | บันทึกครั้งเดียว ไม่ซ้อน server คิดเวลาจบและราคา | `POST /api/bookings`, constraint `booking_no_overlap` (EXCLUDE USING gist), หน้า จองคิว 3 ขั้นตอน | `bookings.test.js` (ราคา/เวลาจบจาก server, 23P01 → 409 SLOT_UNAVAILABLE), ทดสอบบน browser: จองตัดหน้าที่ 11:00 แล้วหน้าเว็บแจ้งพร้อมเวลาใกล้เคียง | ผ่าน (browser 2026-11-13) |
| FR-06 My bookings | เห็นการจองของตัวเอง ยกเลิกคิวที่ยืนยันแล้วก่อนเวลาเริ่ม | `GET /api/bookings`, `POST /api/bookings/:id/cancel`, แท็บ ประวัติการจอง (รีเฟรชทุก 30 วิ) | `bookings.test.js` (query เฉพาะของตัวเอง, ยกเลิกของคนอื่น 403, เริ่มแล้ว 409, ไม่พบ 404), เดโมขั้น 4 และ 7 | ผ่าน |
| FR-07 Staff dashboard | ดูคิวรายวัน เปลี่ยน confirmed → in_progress → completed หรือยกเลิก | `/api/staff/bookings`, `PATCH /api/staff/bookings/:id/status`, หน้า ภาพรวม และ การจอง | `staff.test.js` (ช่วงวันตามเวลาไทย, เปลี่ยนสถานะผิดลำดับ 409), เดโมขั้น 5–6 | ผ่าน |
| FR-08 Failure handling | input ผิด ไม่มีสิทธิ์ นอกเวลา เวลาในอดีต และคิวซ้อน ได้ HTTP error ตามเอกสารและข้อความที่อ่านเข้าใจ | `fail()` ใน helpers, error handler ไม่ log body, แถบข้อความในหน้าเว็บ | `bookings.test.js` (PAST_TIME, OUTSIDE_HOURS, INVALID_INPUT, FORBIDDEN, SLOT_UNAVAILABLE), `app.test.js` (401) | ผ่าน |

## Non-functional requirements

| Requirement | วิธีตรวจ | ผลจริง / สถานะ |
|---|---|---|
| ข้อมูลอยู่รอดหลัง restart (volume `pgdata`) | `docker compose restart` หรือ redeploy แล้วรายการจองยังอยู่ | ผ่าน (redeploy ผ่าน Jenkins 2026-11-12 ข้อมูลยังอยู่) |
| รหัสผ่านเป็น hash, secret ไม่อยู่ใน git | `auth.test.js`, `.gitignore` ครอบ `.env` และ `.env.*`, Jenkins สร้าง `.env` จาก Credentials แล้วลบใน `post cleanup` | ผ่าน |
| Health endpoint และ log ไม่มีรหัสผ่าน/token | `GET /api/health` (200 / 503 เมื่อ DB ล่ม ใน `app.test.js`), error handler log แค่ code | ผ่าน |
| Docker Compose เปิด frontend, backend, db | `docker compose up -d --build` + `scripts/smoke-test.sh` | ผ่าน |
| Jenkins: test → build → deploy → smoke test | Jenkins Stage View | ผ่าน (build #1, #2) · ยังไม่ trigger อัตโนมัติจาก GitHub |
| เริ่มและตรวจได้ใน Course Container `tuchsanai/devtools:2569_1` | ทำตาม README ภายในกล่อง | ยังไม่ได้ตรวจ |

## Defects และข้อจำกัดที่ทราบ

| รายการ | ระดับ | สถานะ |
|---|---|---|
| ยังไม่ได้ตรวจใน Course Container | Major (Reproducibility Gate) | ต้องทำก่อนส่ง |
| Jenkins ต้องสั่ง build เอง ไม่มี webhook | Minor | Known limitation |
| ไม่มี monitoring และ backup อัตโนมัติ | Minor | Known limitation |
| Backend tests จำลองฐานข้อมูล constraint จริงตรวจด้วยเดโม | Minor | Known limitation |
