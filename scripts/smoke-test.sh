#!/bin/sh
# Smoke test for a deployed PetGrooming stack (used by Jenkins after `docker compose up`).
# Usage: scripts/smoke-test.sh   (env: SMOKE_HOST, BACKEND_PORT, FRONTEND_PORT, SMOKE_TIMEOUT)
set -eu

HOST="${SMOKE_HOST:-localhost}"
BACKEND="http://${HOST}:${BACKEND_PORT:-3000}"
FRONTEND="http://${HOST}:${FRONTEND_PORT:-5173}"
TIMEOUT="${SMOKE_TIMEOUT:-90}"

echo "Waiting up to ${TIMEOUT}s for ${BACKEND}/api/health ..."
elapsed=0
until curl -fsS "${BACKEND}/api/health" >/dev/null 2>&1; do
  if [ "$elapsed" -ge "$TIMEOUT" ]; then
    echo "FAIL: backend health did not come up within ${TIMEOUT}s" >&2
    exit 1
  fi
  sleep 3
  elapsed=$((elapsed + 3))
done
echo "OK   backend health"

check() {
  label="$1"; url="$2"
  code=$(curl -s -o /dev/null -w '%{http_code}' "$url" || true)
  if [ "$code" != "200" ]; then
    echo "FAIL ${label}: ${url} returned ${code}" >&2
    exit 1
  fi
  echo "OK   ${label}"
}

check "frontend page" "${FRONTEND}/"
check "nginx -> backend proxy" "${FRONTEND}/api/health"

# Public endpoint backed by the database: must return a JSON array.
services=$(curl -fsS "${BACKEND}/api/services" || true)
case "$services" in
  \[*) echo "OK   services list (database reachable)" ;;
  *) echo "FAIL services list: unexpected body: ${services}" >&2; exit 1 ;;
esac

# Protected endpoint must reject anonymous requests.
check_code() {
  label="$1"; url="$2"; want="$3"
  code=$(curl -s -o /dev/null -w '%{http_code}' "$url" || true)
  if [ "$code" != "$want" ]; then
    echo "FAIL ${label}: expected ${want}, got ${code}" >&2
    exit 1
  fi
  echo "OK   ${label}"
}
check_code "bookings require login" "${BACKEND}/api/bookings" 401

echo "Smoke test passed."
