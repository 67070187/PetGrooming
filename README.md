# PetGrooming

เว็บจองคิวอาบน้ำตัดขนสัตว์เลี้ยงสำหรับร้านเดียว โต๊ะกรูมมิ่งเดียว ลูกค้าเห็นเวลาว่างจริงและจองเองได้ พนักงานจัดการคิวและบริการจาก Staff Panel ฐานข้อมูลกันคิวซ้อนด้วย exclusion constraint

| ส่วน | เทคโนโลยี | พอร์ต |
|---|---|---|
| frontend | React 18 + Vite 5 เสิร์ฟด้วย nginx (ส่ง `/api` ต่อไป backend) | 5173 |
| backend | Node.js 22 + Express 4, JWT, bcryptjs | 3000 |
| db | PostgreSQL 16 (volume `pgdata`) | ไม่เปิดออกนอก Docker network |

เอกสารสัญญาของทีม: [ขอบเขตและ Acceptance Criteria](docs/PROJECT_SPEC.md) · [API](docs/API_SPEC.yaml) · [Database](docs/DATABASE.md) · [Traceability Matrix](docs/TRACEABILITY.md)

## เริ่มระบบ

ต้องมี Docker และ Docker Compose v2 เท่านั้น ไม่ต้องติดตั้ง Node หรือ PostgreSQL บนเครื่อง

```bash
git clone https://github.com/67070187/PetGrooming.git
cd PetGrooming
cp .env.example .env
```

แก้ `.env` ให้ครบทุกค่า:

- `POSTGRES_PASSWORD` และ `JWT_SECRET` (อย่างน้อย 32 ตัวอักษร)
- `STAFF_PASSWORD_HASH` คือ bcrypt hash ของรหัสผ่าน `staff@petgrooming.com` สร้างได้ด้วยคำสั่งนี้ แล้วใส่ไว้ในเครื่องหมาย `'...'`

```bash
docker compose run --rm --no-deps backend node -e "console.log(require('bcryptjs').hashSync('รหัสผ่านที่ต้องการ', 10))"
```

จากนั้นเปิดระบบ:

```bash
docker compose up -d --build
```

- หน้าเว็บ: http://localhost:5173
- Health check: http://localhost:3000/api/health
- บัญชี staff: `staff@petgrooming.com` กับรหัสผ่านที่ใช้สร้าง hash (สร้างให้ครั้งแรกที่ volume ถูกสร้างเท่านั้น)
- บัญชีลูกค้า: สมัครจากหน้าเว็บ การสมัครเองได้บัญชีลูกค้าเสมอ

## ทดสอบ

Backend tests (Jest + Supertest, จำลองฐานข้อมูล ไม่ต้องเปิดระบบ):

```bash
docker run --rm -v "$PWD/backend:/app" -w /app node:22-alpine sh -c "npm ci && npm test"
```

หรือถ้ามี Node 22 บนเครื่อง: `cd backend && npm ci && npm test`

Smoke test หลังเปิดระบบ (ตรวจ health, หน้าเว็บ, nginx → backend, การอ่านฐานข้อมูล และ 401 เมื่อไม่ login):

```bash
sh scripts/smoke-test.sh
```

ถ้ารันจากใน container อื่น ให้ตั้ง `SMOKE_HOST` เป็นชื่อเครื่องที่เข้าถึงพอร์ต 3000 และ 5173 ได้

## หยุดและเก็บกวาด

```bash
docker compose down        # หยุดระบบ ข้อมูลยังอยู่ใน volume pgdata
docker compose down -v     # หยุดและลบข้อมูลทั้งหมด ครั้งต่อไปจะสร้างฐานข้อมูลและบัญชี staff ใหม่
```

ตรวจว่าข้อมูลคงอยู่: จองคิว → `docker compose restart` → รายการจองยังอยู่

## ตรวจใน Course Container `tuchsanai/devtools:2569_1`

ทำตามหัวข้อ "เริ่มระบบ" และ "ทดสอบ" ภายในกล่อง โดย clone รุ่นที่ส่งเข้าไปก่อน ระบบใช้แค่พอร์ต 3000 และ 5173 และไม่พึ่งไฟล์นอก repo ยกเว้น `.env` ที่สร้างจาก `.env.example`

ผลการตรวจในกล่องของรายวิชา: [ยังไม่ได้บันทึก ให้ทีมรันแล้วเติมวันที่ คำสั่ง และผล]

## CI/CD

[Jenkinsfile](Jenkinsfile) รัน 6 stage: Backend tests → Frontend build → Prepare .env (จาก Jenkins Credentials) → Build images (`retry(3)`) → Deploy (`docker compose up -d`) → Smoke test ถ้า stage ไหนไม่ผ่าน pipeline หยุดและพิมพ์ log ของ container ไฟล์ `.env` ถูกลบทุกครั้งหลังจบ

ตั้งค่า Jenkins ครั้งแรก:

- NodeJS tool ชื่อ `Node22`
- Secret text credentials 3 ตัว: `petgrooming-postgres-password`, `petgrooming-jwt-secret`, `petgrooming-staff-password-hash`
- agent ต้องมี docker, docker compose plugin และ curl

## ข้อจำกัดที่ทราบ (Known limitations)

- ไม่มีชำระเงินออนไลน์ หลายสาขา หลายโต๊ะ การมอบหมายช่าง หรือการแจ้งเตือน (นอกขอบเขต MVP ตาม PROJECT_SPEC)
- ไม่มี monitoring (Prometheus/Grafana) และไม่มีระบบ backup อัตโนมัติ ใช้ health check และ log ของ container
- Jenkins ยังต้องสั่ง build เอง ยังไม่ได้ตั้ง webhook จาก GitHub
- Backend tests จำลองฐานข้อมูล กฎกันคิวซ้อนในฐานข้อมูลจริงตรวจด้วยการเดโมและ smoke test

## การใช้ AI Coding Tools

[ให้ทีมเติม: เครื่องมือที่ใช้ เช่น Claude Code และงานที่ใช้ช่วย เช่น ออกแบบหน้าจอ เขียน test เขียน Jenkinsfile ทุกส่วนผ่านการตรวจและทดสอบโดยทีม]
