process.env.JWT_SECRET = 'test_secret_that_is_at_least_32_characters_long';
jest.mock('../src/db', () => ({ query: jest.fn() }));
const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/db');
const app = require('../src/app');

const customerAuth = (id = 2) => ({
  Authorization: `Bearer ${jwt.sign({ id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' })}`,
});

// A Bangkok calendar date `days` from now, so tests never book in the past.
const futureDate = (days = 7) => new Date(Date.now() + days * 86400000 + 7 * 3600000).toISOString().slice(0, 10);

const bath = { id: '2', name: 'อาบน้ำ', duration_minutes: 60, price_thb: 300, active: true };

const bookingRow = (date, over = {}) => ({
  id: '10',
  customer_id: '2',
  pet_id: '3',
  service_id: '2',
  start_at: new Date(`${date}T10:00:00+07:00`),
  end_at: new Date(`${date}T11:00:00+07:00`),
  price_thb: 300,
  status: 'confirmed',
  ...over,
});

beforeEach(() => pool.query.mockReset());

describe('POST /api/bookings (FR-05, FR-08)', () => {
  test('creates a booking; end time and price come from the server, not the client', async () => {
    const date = futureDate();
    pool.query
      .mockResolvedValueOnce({ rows: [{ owner_id: '2' }] })
      .mockResolvedValueOnce({ rows: [bath] })
      .mockResolvedValueOnce({ rows: [bookingRow(date)] });

    const r = await request(app)
      .post('/api/bookings')
      .set(customerAuth())
      .send({ petId: 3, serviceId: 2, date, startTime: '10:00', priceThb: 1, endTime: '10:05' });

    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ id: 10, date, startTime: '10:00', endTime: '11:00', priceThb: 300, status: 'confirmed' });
    const insertArgs = pool.query.mock.calls[2][1];
    expect(insertArgs[4].getTime() - insertArgs[3].getTime()).toBe(60 * 60000);
    expect(insertArgs[5]).toBe(300);
  });

  test('overlapping slot: the database exclusion constraint error becomes 409 SLOT_UNAVAILABLE', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ owner_id: '2' }] })
      .mockResolvedValueOnce({ rows: [bath] })
      .mockRejectedValueOnce(Object.assign(new Error('conflicting key value violates exclusion constraint'), { code: '23P01' }));

    const r = await request(app)
      .post('/api/bookings')
      .set(customerAuth())
      .send({ petId: 3, serviceId: 2, date: futureDate(), startTime: '10:00' });

    expect(r.status).toBe(409);
    expect(r.body.code).toBe('SLOT_UNAVAILABLE');
  });

  test("booking another customer's pet -> 403 FORBIDDEN", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ owner_id: '99' }] });
    const r = await request(app)
      .post('/api/bookings')
      .set(customerAuth())
      .send({ petId: 3, serviceId: 2, date: futureDate(), startTime: '10:00' });
    expect(r.status).toBe(403);
    expect(r.body.code).toBe('FORBIDDEN');
  });

  test('a past date -> 400 PAST_TIME without touching the database', async () => {
    const r = await request(app)
      .post('/api/bookings')
      .set(customerAuth())
      .send({ petId: 3, serviceId: 2, date: '2020-01-01', startTime: '10:00' });
    expect(r.status).toBe(400);
    expect(r.body.code).toBe('PAST_TIME');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('a service that would end after 18:00 -> 400 OUTSIDE_HOURS', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ owner_id: '2' }] }).mockResolvedValueOnce({ rows: [bath] });
    const r = await request(app)
      .post('/api/bookings')
      .set(customerAuth())
      .send({ petId: 3, serviceId: 2, date: futureDate(), startTime: '17:30' });
    expect(r.status).toBe(400);
    expect(r.body.code).toBe('OUTSIDE_HOURS');
  });

  test('before opening time -> 400 OUTSIDE_HOURS', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ owner_id: '2' }] }).mockResolvedValueOnce({ rows: [bath] });
    const r = await request(app)
      .post('/api/bookings')
      .set(customerAuth())
      .send({ petId: 3, serviceId: 2, date: futureDate(), startTime: '08:30' });
    expect(r.status).toBe(400);
    expect(r.body.code).toBe('OUTSIDE_HOURS');
  });

  test('malformed input -> 400 INVALID_INPUT', async () => {
    const r = await request(app)
      .post('/api/bookings')
      .set(customerAuth())
      .send({ petId: 'x', serviceId: 2, date: 'tomorrow', startTime: '10:00' });
    expect(r.status).toBe(400);
    expect(r.body.code).toBe('INVALID_INPUT');
  });
});

describe('GET /api/bookings (FR-06)', () => {
  test('only queries the signed-in customer\'s bookings', async () => {
    pool.query.mockResolvedValueOnce({ rows: [bookingRow(futureDate())] });
    const r = await request(app).get('/api/bookings').set(customerAuth(2));
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(1);
    expect(pool.query.mock.calls[0][1]).toEqual([2]);
  });
});

describe('POST /api/bookings/:bookingId/cancel (FR-06)', () => {
  test('cancels an own confirmed future booking', async () => {
    pool.query.mockResolvedValueOnce({ rows: [bookingRow(futureDate(), { status: 'cancelled' })], rowCount: 1 });
    const r = await request(app).post('/api/bookings/10/cancel').set(customerAuth());
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('cancelled');
  });

  test("another customer's booking -> 403", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ customer_id: '99' }], rowCount: 1 });
    const r = await request(app).post('/api/bookings/10/cancel').set(customerAuth());
    expect(r.status).toBe(403);
  });

  test('already started or not confirmed -> 409 INVALID_STATUS', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ customer_id: '2' }], rowCount: 1 });
    const r = await request(app).post('/api/bookings/10/cancel').set(customerAuth());
    expect(r.status).toBe(409);
    expect(r.body.code).toBe('INVALID_STATUS');
  });

  test('unknown booking -> 404', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }).mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const r = await request(app).post('/api/bookings/10/cancel').set(customerAuth());
    expect(r.status).toBe(404);
  });
});

describe('GET /api/availability (FR-04)', () => {
  test('hides start times that overlap an active booking and times that would end after closing', async () => {
    const date = futureDate();
    pool.query
      .mockResolvedValueOnce({ rows: [bath] })
      .mockResolvedValueOnce({
        rows: [{ start_at: new Date(`${date}T10:00:00+07:00`), end_at: new Date(`${date}T11:00:00+07:00`) }],
      });

    const r = await request(app).get(`/api/availability?date=${date}&serviceId=2`);

    expect(r.status).toBe(200);
    const t = r.body.availableStartTimes;
    expect(t[0]).toBe('09:00');
    expect(t).not.toContain('09:30'); // 09:30-10:30 overlaps 10:00-11:00
    expect(t).not.toContain('10:00');
    expect(t).not.toContain('10:30');
    expect(t).toContain('11:00');
    expect(t[t.length - 1]).toBe('17:00'); // a 60-minute service must finish by 18:00
  });

  test('cancelled bookings are excluded by the query and do not block time', async () => {
    pool.query.mockResolvedValueOnce({ rows: [bath] }).mockResolvedValueOnce({ rows: [] });
    await request(app).get(`/api/availability?date=${futureDate()}&serviceId=2`);
    expect(pool.query.mock.calls[1][0]).toMatch(/status <> 'cancelled'/);
  });
});
