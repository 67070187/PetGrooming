process.env.JWT_SECRET = 'test_secret_that_is_at_least_32_characters_long';
jest.mock('../src/db', () => ({ query: jest.fn() }));
const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/db');
const app = require('../src/app');

const sign = (role, id = 1) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
const staffAuth = () => ({ Authorization: `Bearer ${sign('staff')}` });
const customerAuth = () => ({ Authorization: `Bearer ${sign('customer', 2)}` });

const bookingRow = (over = {}) => ({
    id: '7',
    customer_id: '2',
    pet_id: '3',
    service_id: '1',
    start_at: new Date('2026-10-08T02:00:00Z'), // 09:00 Asia/Bangkok
    end_at: new Date('2026-10-08T03:00:00Z'), // 10:00 Asia/Bangkok
    price_thb: 300,
    status: 'confirmed',
    ...over,
});
const serviceRow = (over = {}) => ({ id: '5', name: 'สปา', duration_minutes: 45, price_thb: 500, active: true, ...over });

beforeEach(() => pool.query.mockReset());

describe('every staff endpoint requires a staff token', () => {
    const endpoints = [
        ['get', '/api/staff/customers'],
        ['get', '/api/staff/pets'],
        ['get', '/api/staff/bookings?date=2026-10-08'],
        ['patch', '/api/staff/bookings/1/status'],
        ['get', '/api/staff/services'],
        ['post', '/api/staff/services'],
        ['patch', '/api/staff/services/1'],
        ['delete', '/api/staff/services/1'],
    ];

    test.each(endpoints)('%s %s -> 401 without token', async (method, url) => {
        const r = await request(app)[method](url).send({ status: 'in_progress' });
        expect(r.status).toBe(401);
        expect(r.body.code).toBe('UNAUTHORIZED');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test.each(endpoints)('%s %s -> 403 for a customer token', async (method, url) => {
        const r = await request(app)[method](url).set(customerAuth()).send({ status: 'in_progress' });
        expect(r.status).toBe(403);
        expect(r.body.code).toBe('FORBIDDEN');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('a malformed token is rejected', async () => {
        const r = await request(app).get('/api/staff/customers').set('Authorization', 'Bearer not.a.jwt');
        expect(r.status).toBe(401);
    });
});

describe('GET /api/staff/customers', () => {
    test('returns customers with pet and booking counts as numbers', async () => {
        pool.query.mockResolvedValue({
            rows: [{ id: '2', name: 'สมชาย ใจดี', email: 'somchai@example.com', pet_count: '2', booking_count: '5' }],
        });
        const r = await request(app).get('/api/staff/customers').set(staffAuth());
        expect(r.status).toBe(200);
        expect(r.body).toEqual([
            { id: 2, name: 'สมชาย ใจดี', email: 'somchai@example.com', petCount: 2, bookingCount: 5 },
        ]);
    });

    test('only selects customer accounts and never exposes password hashes', async () => {
        pool.query.mockResolvedValue({
            rows: [{ id: '2', name: 'A', email: 'a@example.com', pet_count: '0', booking_count: '0', password_hash: 'secret' }],
        });
        const r = await request(app).get('/api/staff/customers').set(staffAuth());
        expect(pool.query.mock.calls[0][0]).toMatch(/role\s*=\s*'customer'/);
        expect(JSON.stringify(r.body)).not.toMatch(/secret|password/i);
    });

    test('database failure -> 500 INTERNAL_ERROR', async () => {
        pool.query.mockRejectedValue(new Error('boom'));
        const r = await request(app).get('/api/staff/customers').set(staffAuth());
        expect(r.status).toBe(500);
        expect(r.body.code).toBe('INTERNAL_ERROR');
    });
});

describe('GET /api/staff/pets', () => {
    test('returns every pet with ownerName', async () => {
        pool.query.mockResolvedValue({
            rows: [
                { id: '3', owner_id: '2', name: 'Milo', species: 'dog', breed: 'Golden Retriever', weight_kg: '18.00', notes: null, owner_name: 'สมชาย ใจดี' },
            ],
        });
        const r = await request(app).get('/api/staff/pets').set(staffAuth());
        expect(r.status).toBe(200);
        expect(r.body).toEqual([
            { id: 3, ownerId: 2, name: 'Milo', species: 'dog', breed: 'Golden Retriever', weightKg: 18, notes: null, ownerName: 'สมชาย ใจดี' },
        ]);
    });
});

describe('GET /api/staff/bookings', () => {
    test.each([['?date=bad'], ['?date=2026-02-30']])('invalid date %p -> 400', async (qs) => {
        const r = await request(app).get(`/api/staff/bookings${qs}`).set(staffAuth());
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('INVALID_INPUT');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('queries the Asia/Bangkok day window and returns Bangkok local times', async () => {
        pool.query.mockResolvedValue({ rows: [bookingRow()] });
        const r = await request(app).get('/api/staff/bookings?date=2026-10-08').set(staffAuth());
        expect(r.status).toBe(200);
        const [, params] = pool.query.mock.calls[0];
        expect(params[0]).toEqual(new Date('2026-10-08T00:00:00+07:00'));
        expect(params[1]).toEqual(new Date('2026-10-09T00:00:00+07:00'));
        expect(r.body).toEqual([
            { id: 7, customerId: 2, customerName: undefined, customerEmail: undefined, petId: 3, petName: undefined, petSpecies: undefined, serviceId: 1, serviceName: undefined, date: '2026-10-08', startTime: '09:00', endTime: '10:00', priceThb: 300, status: 'confirmed' },
        ]);
    });


    test('without a date returns all bookings with joined customer, pet and service names', async () => {
        pool.query.mockResolvedValue({ rows: [bookingRow({ customer_name: 'สมชาย', customer_email: 'somchai@example.com', pet_name: 'Milo', pet_species: 'dog', service_name: 'อาบน้ำ' })] });
        const r = await request(app).get('/api/staff/bookings').set(staffAuth());
        expect(r.status).toBe(200);
        expect(pool.query.mock.calls[0][0]).toMatch(/JOIN users/);
        expect(pool.query.mock.calls[0][0]).toMatch(/JOIN pets/);
        expect(pool.query.mock.calls[0][0]).toMatch(/JOIN services/);
        expect(r.body[0]).toMatchObject({ customerName: 'สมชาย', customerEmail: 'somchai@example.com', petName: 'Milo', serviceName: 'อาบน้ำ' });
        expect(pool.query.mock.calls[0][1]).toEqual([]);
    });

    test('empty day returns an empty array', async () => {
        pool.query.mockResolvedValue({ rows: [] });
        const r = await request(app).get('/api/staff/bookings?date=2026-10-08').set(staffAuth());
        expect(r.status).toBe(200);
        expect(r.body).toEqual([]);
    });
});

describe('PATCH /api/staff/bookings/:bookingId/status', () => {
    const patch = (id, body) => request(app).patch(`/api/staff/bookings/${id}/status`).set(staffAuth()).send(body);

    test.each([
        ['in_progress', 'confirmed'],
        ['cancelled', 'confirmed'],
        ['completed', 'in_progress'],
    ])('-> %s is only allowed from %s', async (status, previous) => {
        pool.query.mockResolvedValue({ rowCount: 1, rows: [bookingRow({ status })] });
        const r = await patch(7, { status });
        expect(r.status).toBe(200);
        expect(r.body.status).toBe(status);
        expect(pool.query.mock.calls[0][1]).toEqual([status, '7', previous]);
    });

    test.each([[{}], [{ status: 'confirmed' }], [{ status: 'nope' }], [{ status: 5 }]])(
        'invalid body %p -> 400',
        async (body) => {
            const r = await patch(7, body);
            expect(r.status).toBe(400);
            expect(r.body.code).toBe('INVALID_INPUT');
            expect(pool.query).not.toHaveBeenCalled();
        }
    );

    test.each([['abc'], ['0'], ['-3']])('invalid booking id %p -> 400', async (bad) => {
        const r = await patch(bad, { status: 'in_progress' });
        expect(r.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('illegal transition on an existing booking -> 409 INVALID_STATUS', async () => {
        pool.query
            .mockResolvedValueOnce({ rowCount: 0, rows: [] }) // guarded UPDATE matched nothing
            .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: '7' }] }); // booking exists
        const r = await patch(7, { status: 'completed' });
        expect(r.status).toBe(409);
        expect(r.body.code).toBe('INVALID_STATUS');
    });

    test('unknown booking -> 404 NOT_FOUND', async () => {
        pool.query.mockResolvedValue({ rowCount: 0, rows: [] });
        const r = await patch(999, { status: 'in_progress' });
        expect(r.status).toBe(404);
        expect(r.body.code).toBe('NOT_FOUND');
    });
});

describe('staff service catalog', () => {
    test('GET /api/staff/services includes inactive services', async () => {
        pool.query.mockResolvedValue({ rows: [serviceRow(), serviceRow({ id: '6', name: 'เก่า', active: false })] });
        const r = await request(app).get('/api/staff/services').set(staffAuth());
        expect(r.status).toBe(200);
        expect(r.body).toEqual([
            { id: 5, name: 'สปา', durationMinutes: 45, priceThb: 500, active: true },
            { id: 6, name: 'เก่า', durationMinutes: 45, priceThb: 500, active: false },
        ]);
        expect(pool.query.mock.calls[0][0]).not.toMatch(/active\s*=\s*true/i);
    });

    test('POST creates a service (active defaults to true) -> 201', async () => {
        pool.query.mockResolvedValue({ rows: [serviceRow()] });
        const r = await request(app).post('/api/staff/services').set(staffAuth())
            .send({ name: '  สปา  ', durationMinutes: 45, priceThb: 500 });
        expect(r.status).toBe(201);
        expect(r.body).toEqual({ id: 5, name: 'สปา', durationMinutes: 45, priceThb: 500, active: true });
        expect(pool.query.mock.calls[0][1]).toEqual(['สปา', 45, 500, true]);
    });

    test.each([
        [{}],
        [{ name: 'x', durationMinutes: 45 }],
        [{ name: '', durationMinutes: 45, priceThb: 1 }],
        [{ name: 'x', durationMinutes: 0, priceThb: 1 }],
        [{ name: 'x', durationMinutes: 541, priceThb: 1 }],
        [{ name: 'x', durationMinutes: 30.5, priceThb: 1 }],
        [{ name: 'x', durationMinutes: '30', priceThb: 1 }],
        [{ name: 'x', durationMinutes: 30, priceThb: -1 }],
        [{ name: 'x', durationMinutes: 30, priceThb: 1, active: 'yes' }],
    ])('POST invalid body %j -> 400', async (body) => {
        const r = await request(app).post('/api/staff/services').set(staffAuth()).send(body);
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('INVALID_INPUT');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('POST duplicate name -> 409 SERVICE_EXISTS', async () => {
        pool.query.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));
        const r = await request(app).post('/api/staff/services').set(staffAuth())
            .send({ name: 'อาบน้ำ', durationMinutes: 60, priceThb: 300 });
        expect(r.status).toBe(409);
        expect(r.body.code).toBe('SERVICE_EXISTS');
    });

    test('PATCH updates only the supplied fields', async () => {
        pool.query.mockResolvedValue({ rowCount: 1, rows: [serviceRow({ price_thb: 550, active: false })] });
        const r = await request(app).patch('/api/staff/services/5').set(staffAuth()).send({ priceThb: 550, active: false });
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ id: 5, name: 'สปา', durationMinutes: 45, priceThb: 550, active: false });
        const [sql, params] = pool.query.mock.calls[0];
        expect(sql).toMatch(/SET price_thb=\$1,active=\$2 WHERE id=\$3/);
        expect(params).toEqual([550, false, 5]);
    });

    test('PATCH ignores unknown fields and cannot set arbitrary columns', async () => {
        const r = await request(app).patch('/api/staff/services/5').set(staffAuth()).send({ id: 9, 'name=1;--': 'x' });
        expect(r.status).toBe(400); // nothing valid to update
        expect(pool.query).not.toHaveBeenCalled();
    });

    test.each([['abc'], ['0']])('PATCH invalid service id %p -> 400', async (bad) => {
        const r = await request(app).patch(`/api/staff/services/${bad}`).set(staffAuth()).send({ priceThb: 1 });
        expect(r.status).toBe(400);
    });

    test('PATCH unknown service -> 404', async () => {
        pool.query.mockResolvedValue({ rowCount: 0, rows: [] });
        const r = await request(app).patch('/api/staff/services/99').set(staffAuth()).send({ priceThb: 1 });
        expect(r.status).toBe(404);
        expect(r.body.code).toBe('NOT_FOUND');
    });

    test('PATCH renaming to an existing name -> 409 SERVICE_EXISTS', async () => {
        pool.query.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));
        const r = await request(app).patch('/api/staff/services/5').set(staffAuth()).send({ name: 'อาบน้ำ' });
        expect(r.status).toBe(409);
        expect(r.body.code).toBe('SERVICE_EXISTS');
    });
});
describe('DELETE /api/staff/services/:serviceId', () => {
    test('rejects an invalid id', async () => {
        const r = await request(app).delete('/api/staff/services/abc').set(staffAuth());
        expect(r.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('returns 404 for an unknown service', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        const r = await request(app).delete('/api/staff/services/99').set(staffAuth());
        expect(r.status).toBe(404);
    });

    test('refuses to delete a service that has any booking', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [serviceRow()], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 });
        const r = await request(app).delete('/api/staff/services/5').set(staffAuth());
        expect(r.status).toBe(409);
        expect(r.body.code).toBe('SERVICE_HAS_BOOKINGS');
        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test('deletes a never-booked service and returns it', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [serviceRow()], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 })
            .mockResolvedValueOnce({ rows: [], rowCount: 1 });
        const r = await request(app).delete('/api/staff/services/5').set(staffAuth());
        expect(r.status).toBe(200);
        expect(r.body).toMatchObject({ id: 5, name: 'สปา' });
        expect(pool.query.mock.calls[2][0]).toMatch(/DELETE FROM services/);
        expect(pool.query.mock.calls[2][1]).toEqual([5]);
    });

    test('maps a foreign-key race to 409 SERVICE_HAS_BOOKINGS', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [serviceRow()], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 })
            .mockRejectedValueOnce(Object.assign(new Error('fk'), { code: '23503' }));
        const r = await request(app).delete('/api/staff/services/5').set(staffAuth());
        expect(r.status).toBe(409);
        expect(r.body.code).toBe('SERVICE_HAS_BOOKINGS');
    });
});
