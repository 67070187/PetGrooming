CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer','staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pets (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  species VARCHAR(10) NOT NULL CHECK (species IN ('dog','cat')),
  breed VARCHAR(100),
  weight_kg NUMERIC(6,2) NOT NULL CHECK (weight_kg > 0),
  notes VARCHAR(1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price_thb INTEGER NOT NULL CHECK (price_thb >= 0),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES users(id),
  pet_id BIGINT NOT NULL REFERENCES pets(id),
  service_id BIGINT NOT NULL REFERENCES services(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  price_thb INTEGER NOT NULL CHECK (price_thb >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed','in_progress','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_positive_duration CHECK (end_at > start_at),
  CONSTRAINT booking_no_overlap EXCLUDE USING gist
    (tstzrange(start_at, end_at, '[)') WITH &&)
    WHERE (status <> 'cancelled')
);

CREATE INDEX bookings_customer_idx ON bookings(customer_id, start_at DESC);
CREATE INDEX bookings_date_idx ON bookings(start_at);
CREATE INDEX pets_owner_idx ON pets(owner_id);
