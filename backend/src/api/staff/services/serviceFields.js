// Shared validation/mapping for the staff service-catalog endpoints (FR-03, admin maintenance).
const MAX_DURATION_MIN = 540; // 09:00-18:00: a longer service could never fit in one day
const MAX_PRICE_THB = 2147483647; // INTEGER column limit

const service = (s) => ({
  id: Number(s.id),
  name: s.name,
  durationMinutes: s.duration_minutes,
  priceThb: s.price_thb,
  active: s.active,
});

// Returns a { column: value } object, or null when the body is invalid.
// create: name, durationMinutes, priceThb required. partial: at least one known field.
function parseServiceInput(body, { partial }) {
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const v = {};

  if (b.name !== undefined) {
    if (typeof b.name !== 'string' || !b.name.trim() || b.name.trim().length > 100) return null;
    v.name = b.name.trim();
  }
  if (b.durationMinutes !== undefined) {
    if (!Number.isInteger(b.durationMinutes) || b.durationMinutes < 1 || b.durationMinutes > MAX_DURATION_MIN) return null;
    v.duration_minutes = b.durationMinutes;
  }
  if (b.priceThb !== undefined) {
    if (!Number.isInteger(b.priceThb) || b.priceThb < 0 || b.priceThb > MAX_PRICE_THB) return null;
    v.price_thb = b.priceThb;
  }
  if (b.active !== undefined) {
    if (typeof b.active !== 'boolean') return null;
    v.active = b.active;
  }

  if (partial) return Object.keys(v).length ? v : null;
  return v.name !== undefined && v.duration_minutes !== undefined && v.price_thb !== undefined ? v : null;
}

module.exports = { service, parseServiceInput };
