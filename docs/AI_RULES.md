# PetGrooming — AI Coding Rules

**All four members must give their coding assistants this file and the current versions of `PROJECT_SPEC.md`, `API_SPEC.yaml` and `DATABASE.md` before requesting implementation.** These documents are the approved contract baseline. Do not invent missing requirements.

## 1. Required reading and source of truth
1. Read `PROJECT_SPEC.md` for scope, roles, user flow, business rules and acceptance criteria.
2. Read `API_SPEC.yaml` for exact HTTP methods, paths, payloads, response schemas and error codes.
3. Read `DATABASE.md` for PostgreSQL tables, migrations, constraints and time handling.
4. Inspect existing repository files, package manifests, tests and current branch before modifying anything.
5. If documents conflict, STOP and describe the conflict; ask the team to resolve it in a reviewed PR. Do not silently choose a different design.

## 2. Technology and architecture constraints
- Frontend: React; backend: Node.js + Express; PostgreSQL; Docker Compose; Jenkins; Jest + Supertest.
- One shop, one grooming station, Asia/Bangkok timezone, 09:00–18:00 operating hours, 30-minute start-time boundaries.
- Keep frontend/backend/database separate, and use environment variables for runtime configuration.
- Do not add AI diagnosis, payment gateways, microservices, Redis, message brokers, extra branches or new frameworks without approval.
- Do not change API paths, JSON field names, database columns, booking statuses or dependencies without an approved contract-change PR.

## 3. Work ownership
- Frontend owner: `frontend/**`; may propose API changes, but cannot independently modify backend contract.
- Backend owner: `backend/**`; coordinates API and business rules with database/testing owner.
- Database/testing owner: `database/**` and shared test fixtures; coordinate backend test changes.
- DevOps owner: `docker-compose.yml`, `Jenkinsfile`, deployment scripts and environment templates.
- `docs/**` contract changes require review from every affected owner. Shared files require explicit coordination.
- Never overwrite, delete or rewrite another member's work, uncommitted changes or test fixtures without permission.

## 4. Workflow for every AI coding task
Before coding, output:
- Goal and linked requirement IDs (FR-xx).
- Files to inspect and files to change.
- Relevant API/DB contract sections and assumptions.
- Planned tests and expected failure cases.

Then implement the smallest complete change. After coding, output:
- Exact files changed and why.
- Commands run, actual test/build results and any failures; never claim tests passed unless executed.
- Any breaking changes, migration needs, risks and remaining work.
- Suggested PR title and concise description.

## 5. Coding and integration rules
- Use API_SPEC.yaml literally: do not invent endpoints, silently rename fields or change error shapes.
- Client must not calculate authoritative end time or price; backend derives them from the service record.
- Booking overlap must be protected by PostgreSQL constraint/transaction; handle SQLSTATE `23P01` as HTTP 409 `SLOT_UNAVAILABLE`.
- Backend validates inputs, pet ownership, staff roles, opening hours, future slots and legal status transitions.
- Keep errors consistent: `{ "code": "SLOT_UNAVAILABLE", "message": "..." }`.
- Prefer small functions, explicit names, stable dependencies and tests for edge cases.
- Do not suppress failing tests, weaken validation or disable security checks to make a build green.

## 6. Security and privacy
- Never commit `.env`, credentials, JWTs, real user data or secrets; maintain `.env.example` with placeholder values.
- Passwords must be securely hashed. Public registration cannot assign `staff` role.
- Do not log passwords, Authorization headers or sensitive pet/customer notes.
- Validate and authorize every protected endpoint. Keep customer data isolated.

## 7. Git and PR discipline
- Work on short-lived `feature/...` branches; do not push directly to `main`.
- Pull latest approved contract before starting; commit small changes with meaningful messages.
- Open PRs and request review from at least one other team member; contract changes require all affected owners.
- CI must pass lint/build/tests/integration/smoke checks before merging, as configured.
- Merge one feature at a time and re-run tests after resolving conflicts.

## 8. Minimum tests and demo
- Register/login, pet ownership, list services, availability, create booking, list own bookings, cancel booking and staff status update.
- Reject overlapping and concurrent bookings, past/closed-hours requests, invalid input, unauthorized requests and invalid status transitions.
- Docker Compose must persist PostgreSQL data; Jenkins must build/test/deploy and run a smoke test.
- Run formal verification in course container `tuchsanai/devtools:2569_1`.

## 9. Reusable prompt
```text
You are implementing one scoped PetGrooming task in our four-person team.
Read PROJECT_SPEC.md, API_SPEC.yaml, DATABASE.md and AI_RULES.md first.
Inspect existing code and identify the relevant FR IDs.
Before editing, list files to change, contract assumptions and tests.
Do not modify another owner's files or alter API/schema/dependencies without approval.
Implement the smallest working change, add tests, and run available checks.
Report actual results, changed files, unresolved conflicts and a suggested PR description.
If the contract is ambiguous or contradictory, stop and ask for clarification.
```
