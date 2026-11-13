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

สคริปต์ตรวจแบบอัตโนมัติ: [scripts/course-container-verify.sh](scripts/course-container-verify.sh) (clone จาก GitHub, สร้าง `.env` ด้วยค่าทดสอบ, เปิดระบบ, test, smoke test, ตรวจ 409/403/401, restart, เก็บกวาด)

```bash
docker run -d --privileged --name devtools tuchsanai/devtools:2569_1
docker cp scripts/course-container-verify.sh devtools:/root/verify.sh
docker exec devtools bash /root/verify.sh
```

**ผลการตรวจ 13 พ.ย. 2569: ผ่านทุกข้อ** ([log เต็ม](docs/evidence/course-container-2026-11-13.log)) รุ่นที่ตรวจคือ `main` ที่ commit `359f8f2`

| สิ่งที่ตรวจ | ผล |
|---|---|
| `docker compose up -d --build` ในกล่อง | db healthy, backend และ frontend ทำงาน |
| Backend tests | 93/93 ผ่าน |
| `scripts/smoke-test.sh` | ผ่าน 5/5 (health, หน้าเว็บ, nginx → backend, ฐานข้อมูล, 401) |
| จองช่วงเวลาซ้ำ | 409 SLOT_UNAVAILABLE |
| ส่งคำขอจองเวลาเดียวกันพร้อมกัน 2 คำขอ | 201 หนึ่งคำขอ 409 หนึ่งคำขอ ในฐานข้อมูลมีแถวเดียว |
| ลูกค้าเรียก `/api/staff/bookings` / ไม่มี token | 403 / 401 |
| `docker compose restart` | การจองก่อน 2 รายการ หลัง 2 รายการ |
| `docker compose down -v` | ลบ container, network และ volume ครบ |

## CI/CD

[Jenkinsfile](Jenkinsfile) รัน 6 stage: Backend tests → Frontend build → Prepare .env (จาก Jenkins Credentials) → Build images (`retry(3)`) → Deploy (`docker compose up -d`) → Smoke test ถ้า stage ไหนไม่ผ่าน pipeline หยุดและพิมพ์ log ของ container ไฟล์ `.env` ถูกลบทุกครั้งหลังจบ

Pipeline เริ่มเองเมื่อมี commit ใหม่บน GitHub: Jenkinsfile ตั้ง `pollSCM('H/2 * * * *')` ให้ Jenkins ตรวจ repo ทุก 2 นาที ใช้ polling เพราะ Jenkins ของทีมไม่ได้เปิดให้เข้าถึงจากอินเทอร์เน็ต GitHub จึงส่ง webhook มาไม่ได้ ถ้ามี Jenkins ที่มี URL สาธารณะ ให้เปลี่ยนเป็น `githubPush()` และตั้ง webhook ที่ GitHub แทน

ตั้งค่า Jenkins ครั้งแรก:

- NodeJS tool ชื่อ `Node22`
- Secret text credentials 3 ตัว: `petgrooming-postgres-password`, `petgrooming-jwt-secret`, `petgrooming-staff-password-hash`
- agent ต้องมี docker, docker compose plugin และ curl

## ข้อจำกัดที่ทราบ (Known limitations)

- ไม่มีชำระเงินออนไลน์ หลายสาขา หลายโต๊ะ การมอบหมายช่าง หรือการแจ้งเตือน (นอกขอบเขต MVP ตาม PROJECT_SPEC)
- ไม่มี monitoring (Prometheus/Grafana) และไม่มีระบบ backup อัตโนมัติ ใช้ health check และ log ของ container
- Jenkins ใช้ polling ทุก 2 นาทีแทน webhook (Jenkins ไม่ได้เปิดสู่อินเทอร์เน็ต)
- Backend tests อัตโนมัติจำลองฐานข้อมูล ยังไม่มี integration test อัตโนมัติกับ PostgreSQL จริงใน pipeline กฎกันคิวซ้อนกับฐานข้อมูลจริงตรวจด้วยมือ (ดูผลตรวจใน Course Container)

## การใช้ AI Coding Tools

ใช้ Claude Code ช่วยออกแบบหน้าลูกค้าและ admin เขียน automated test, Jenkinsfile, README, Traceability Matrix และสไลด์ ทุกส่วนผ่านการตรวจโดยทีมด้วย test, การลองบน browser, Jenkins build และการรันใน Course Container ตามกติกาใน [docs/AI_RULES.md](docs/AI_RULES.md)
