# PetGrooming — Project Specification

Version: 1.0 (baseline proposal)  
Status: Draft for approval by all four team members

## 1. Problem and goal
Small pet-grooming shops may receive bookings by phone or chat, making availability difficult to verify and risking overlapping appointments. PetGrooming is a single-shop web application for customers to register pets, select grooming services, see available slots, book and cancel appointments; staff manage bookings and service statuses.

**Target users:** Customers and shop staff/admin. This MVP is for **one shop and one grooming station/staff capacity of one appointment at a time**. The team can change this only through an approved specification update.

## 2. Technology baseline
- Frontend: React; backend: Node.js + Express; database: PostgreSQL.
- Authentication: JWT for authenticated API calls, password hashes using a maintained password-hashing library.
- Source control: Git/GitHub; deployment: Docker Compose; CI/CD: Jenkins; backend tests: Jest + Supertest.
- All services must start and pass verification in the course container `tuchsanai/devtools:2569_1`. No cloud dependency is required for the MVP.

## 3. MVP functional requirements
| ID | Feature | Acceptance criteria |
|---|---|---|
| FR-01 | Register/login | Customer can register, log in and access only their own pet and booking records; staff has role-based access. |
| FR-02 | Pet profile | Customer can create and view pets with name, species, breed, weight and optional grooming notes. |
| FR-03 | Services | Everyone can view active services and their fixed duration and starting price; admin can maintain service catalog (optional after core flow). |
| FR-04 | Availability | Customer sees available start times for a date, calculated from opening hours, service duration and existing active bookings. |
| FR-05 | Booking | Customer books one pet and one service at an available start time; booking is persisted exactly once, no overlap allowed. |
| FR-06 | My bookings | Customer sees their bookings and can cancel a confirmed booking before its start time. |
| FR-07 | Staff dashboard | Staff can list bookings by date and update `confirmed` → `in_progress` → `completed`, or cancel confirmed bookings. |
| FR-08 | Failure handling | Invalid data, unauthorized access, closed hours, past time and overlapping bookings produce documented HTTP errors and understandable UI messages. |

## 4. Business rules (MVP)
- Shop timezone: `Asia/Bangkok`. Shop opens daily **09:00–18:00** for the MVP (configurable later). The last booking must finish by closing.
- One grooming station: **at most one active appointment at any instant**. Active means `confirmed` or `in_progress`; cancelled bookings do not block time; completed bookings remain historical and their past slots are not reusable.
- One booking has exactly one pet and one service. Fixed service durations are measured in minutes; price is captured at booking time.
- Default seed services (illustrative, confirm with team/shop): bath 60 min / THB 300; haircut 90 min / THB 450; nail trim 20 min / THB 100; bath + haircut 120 min / THB 650.
- Available start times are generated every 30 minutes; the full service duration must fit and not overlap another booking. A 20-minute nail trim can begin on a 30-minute boundary.
- The example `2026-09-26 09:00` is a **historical/test fixture** if run after that date; real booking rejects past dates/times. Do not assume that slot is currently bookable.
- A booking request includes `petId`, `serviceId`, `date`, `startTime`. The server calculates end time and price; the client must not decide them.
- Overlap protection must be enforced in the database transaction, not only through a frontend check. A PostgreSQL exclusion constraint on a timestamp range is recommended; see DATABASE.md.
- `confirmed` bookings can be cancelled before their start time. Staff alone may mark `in_progress` or `completed`. No rescheduling or payment in MVP.

## 5. Primary end-to-end user flow
1. Customer logs in and creates/selects a pet.
2. Customer selects an active service (e.g. bath, 60 min).
3. Frontend requests availability for selected local date and service.
4. Customer chooses a start time (e.g. 09:00), then confirms.
5. Backend authenticates user, validates pet ownership, service, opening hours and future date/time, then atomically inserts booking if the slot is free.
6. Frontend shows booking ID, date/time and `confirmed` status; staff sees the same booking.
7. Staff changes status to `in_progress`, then `completed`; customer can see updated status.

## 6. Out of scope
Online payments, multiple branches, simultaneous grooming stations, employee assignment, AI diagnosis, external messaging, maps and automatic pricing by breed/weight. These require an approved scope change.

## 7. Non-functional requirements and evidence
- PostgreSQL data survives container restart through a named Docker volume.
- Passwords are hashed; JWT secret and database credentials are environment variables and never committed.
- Health endpoint `GET /api/health`; readable logs without passwords/tokens; input validation and authorization on every protected endpoint.
- Docker Compose brings up frontend, backend and database; Jenkins runs install/lint (if configured), tests, build, deploy and smoke test.
- Demo includes successful booking, duplicate/overlapping booking rejection, unauthorized access and data persistence after restart.
- Keep traceability: each requirement maps to API endpoint, UI flow, test and demo evidence.

## 8. Team ownership
1. Frontend: customer pages, staff dashboard and API integration.
2. Backend: authentication, business rules and REST endpoints.
3. Database & testing: migrations, seed data, constraints and automated tests.
4. DevOps & integration: Compose, Jenkins, secrets/config templates and course-container verification.

All four approve contract changes via pull request. Every feature owner contributes tests and explains their integration during demo.

## 9. Change control
`PROJECT_SPEC.md`, `API_SPEC.yaml` and `DATABASE.md` form the contract baseline. Any change to endpoint, schema, business rule, status, timezone or dependency requires a pull request, explanation of impacts, updated tests and review from affected owners. AI output is not authoritative.
