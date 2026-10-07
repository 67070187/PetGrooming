// Shared helpers for the API layer. Shop timezone is fixed to Asia/Bangkok (UTC+7, no DST).
const fail = (res, status, code, message) => res.status(status).json({ code, message });

const id = (x) => (Number.isSafeInteger(Number(x)) && Number(x) > 0 ? Number(x) : null);

const dateOk = (d) =>
  typeof d === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(d) &&
  !Number.isNaN(Date.parse(d + 'T00:00:00Z')) &&
  new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d;

const timeOk = (t) => typeof t === 'string' && /^([01]\d|2[0-3]):(00|30)$/.test(t);

const localStart = (d, t) => new Date(`${d}T${t}:00+07:00`);

const bangkok = (dt) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(dt)
    .reduce((o, p) => ((o[p.type] = p.value), o), {});

function booking(b) {
  const a = bangkok(new Date(b.start_at));
  const z = bangkok(new Date(b.end_at));
  return {
    id: Number(b.id),
    petId: Number(b.pet_id),
    serviceId: Number(b.service_id),
    date: `${a.year}-${a.month}-${a.day}`,
    startTime: `${a.hour}:${a.minute}`,
    endTime: `${z.hour}:${z.minute}`,
    priceThb: b.price_thb,
    status: b.status,
  };
}

const pet = (p) => ({
  id: Number(p.id),
  ownerId: Number(p.owner_id),
  name: p.name,
  species: p.species,
  breed: p.breed,
  weightKg: Number(p.weight_kg),
  notes: p.notes,
});

module.exports = { fail, id, dateOk, timeOk, localStart, bangkok, booking, pet };
