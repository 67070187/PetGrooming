#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -c "INSERT INTO users (name, email, password_hash, role)
      VALUES ('Staff', 'staff@petgrooming.com', '$STAFF_PASSWORD_HASH', 'staff')
      ON CONFLICT (email) DO NOTHING;"
