#!/bin/bash
# Course Container verification for PetGrooming. Runs INSIDE tuchsanai/devtools:2569_1.
set -u
step() { echo; echo "=== [$(date '+%Y-%m-%d %H:%M:%S %Z')] $*"; }
retry() { for i in 1 2 3 4 5; do "$@" && return 0; echo "retry $i: $*"; sleep 10; done; return 1; }

step "Environment"
cat /etc/os-release | head -2; docker --version; docker compose version; git --version

step "Wait for dockerd"
for i in $(seq 1 60); do docker info >/dev/null 2>&1 && break; sleep 2; done
docker info --format 'dockerd ready: {{.ServerVersion}}'

step "Clone submitted version from GitHub (main)"
cd /workspace && rm -rf PetGrooming
git clone -q https://github.com/67070187/PetGrooming.git && cd PetGrooming
git log -1 --format='commit %H %s'

step "Create .env from .env.example (test-only secrets generated here)"
cp .env.example .env
PG_PW=$(openssl rand -hex 16); JWT=$(openssl rand -hex 32)
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${PG_PW}/; s/^JWT_SECRET=.*/JWT_SECRET=${JWT}/" .env
STAFF_PW=$(openssl rand -hex 8)
echo "$STAFF_PW" > /root/staff_pw.txt
HASH=$(retry docker run --rm -e PW="$STAFF_PW" node:22-alpine sh -c "cd /tmp && npm i -s bcryptjs@2.4.3 >/dev/null 2>&1 && node -e \"console.log(require('bcryptjs').hashSync(process.env.PW,10))\"" | tail -1)
sed -i "s|^STAFF_PASSWORD_HASH=.*|STAFF_PASSWORD_HASH='${HASH}'|" .env
grep -c . .env | sed 's/^/.env lines: /'

step "docker compose up -d --build"
retry docker compose up -d --build 2>&1 | tail -15
docker compose ps

step "Backend automated tests (node:22-alpine)"
retry docker run --rm -v "$PWD/backend:/app" -w /app node:22-alpine sh -c "npm ci --silent && npm test --silent" 2>&1 | grep -E "^Tests:|^Test Suites:|FAIL"

step "Smoke test (scripts/smoke-test.sh)"
sh scripts/smoke-test.sh

step "End-to-end API checks"
api=http://localhost:3000/api
curl -s -o /dev/null -w "frontend page            -> %{http_code}\n" http://localhost:5173/
curl -s -w "\nhealth                   -> %{http_code}\n" $api/health
EMAIL="cc-$(date +%s)@example.test"
curl -s -o /dev/null -w "register customer        -> %{http_code}\n" -X POST $api/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"CC Test\",\"email\":\"$EMAIL\",\"password\":\"cc-password-123\"}"
TOKEN=$(curl -s -X POST $api/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"cc-password-123\"}" | sed -E 's/.*"token":"([^"]+)".*/\1/')
AUTH="Authorization: Bearer $TOKEN"
PET=$(curl -s -X POST $api/pets -H 'Content-Type: application/json' -H "$AUTH" -d '{"name":"Lucky","species":"dog","breed":"Shiba","weightKg":8}' | sed -E 's/.*"id":([0-9]+).*/\1/')
echo "created pet id $PET"
SVC=$(curl -s $api/services | sed -E 's/^\[\{"id":([0-9]+).*/\1/')
DAY=$(TZ=Asia/Bangkok date -d '+2 day' +%F)
BODY="{\"petId\":$PET,\"serviceId\":$SVC,\"date\":\"$DAY\",\"startTime\":\"10:00\"}"
curl -s -w "\nfirst booking $DAY 10:00 -> %{http_code}\n" -X POST $api/bookings -H 'Content-Type: application/json' -H "$AUTH" -d "$BODY"
curl -s -w "\nsame slot again          -> %{http_code}\n" -X POST $api/bookings -H 'Content-Type: application/json' -H "$AUTH" -d "$BODY"

step "Concurrent booking: 2 requests for one new slot at the same time"
BODY2="{\"petId\":$PET,\"serviceId\":$SVC,\"date\":\"$DAY\",\"startTime\":\"14:00\"}"
for n in 1 2; do (curl -s -o /dev/null -w "concurrent request $n -> %{http_code}\n" -X POST $api/bookings -H 'Content-Type: application/json' -H "$AUTH" -d "$BODY2") & done; wait
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT count(*) FROM bookings WHERE status<>'"'"'cancelled'"'"'"' | sed 's/^/active bookings in DB: /'

step "Authorization: customer token on a staff endpoint"
curl -s -o /dev/null -w "GET /api/staff/bookings as customer -> %{http_code}\n" $api/staff/bookings -H "$AUTH"
curl -s -o /dev/null -w "GET /api/bookings without token     -> %{http_code}\n" $api/bookings

step "Persistence: restart all containers"
BEFORE=$(curl -s $api/bookings -H "$AUTH" | grep -o '"id"' | wc -l)
docker compose restart 2>&1 | tail -3
for i in $(seq 1 40); do curl -fs $api/health >/dev/null && break; sleep 3; done
AFTER=$(curl -s $api/bookings -H "$AUTH" | grep -o '"id"' | wc -l)
echo "customer bookings before restart: $BEFORE, after restart: $AFTER"

step "Stop and clean up"
docker compose down -v 2>&1 | tail -3
docker compose ps
step "DONE"
