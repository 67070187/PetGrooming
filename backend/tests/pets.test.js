process.env.JWT_SECRET = 'test_secret_that_is_at_least_32_characters_long';
jest.mock('../src/db', () => ({ query: jest.fn() }));
const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/db');
const app = require('../src/app');

const customerAuth = (id = 2) => ({
    Authorization: `Bearer ${jwt.sign({ id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' })}`,
});

const petRow = (over = {}) => ({
    id: '3',
    owner_id: '2',
    name: 'Lucky',
    species: 'dog',
    breed: 'Shiba',
    weight_kg: '8.00',
    notes: null,
    ...over,
});

beforeEach(() => pool.query.mockReset());

describe('DELETE /api/pets/:petId', () => {
    test('requires authentication', async () => {
        const r = await request(app).delete('/api/pets/3');
        expect(r.status).toBe(401);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('rejects an invalid id', async () => {
        const r = await request(app).delete('/api/pets/abc').set(customerAuth());
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('INVALID_INPUT');
    });

    test('returns 404 for an unknown pet', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        const r = await request(app).delete('/api/pets/99').set(customerAuth());
        expect(r.status).toBe(404);
        expect(r.body.code).toBe('NOT_FOUND');
    });

    test("refuses to delete another customer's pet", async () => {
        pool.query.mockResolvedValueOnce({ rows: [petRow({ owner_id: '5' })], rowCount: 1 });
        const r = await request(app).delete('/api/pets/3').set(customerAuth());
        expect(r.status).toBe(403);
        expect(r.body.code).toBe('FORBIDDEN');
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('refuses to delete a pet that has any booking', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [petRow()], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 });
        const r = await request(app).delete('/api/pets/3').set(customerAuth());
        expect(r.status).toBe(409);
        expect(r.body.code).toBe('PET_HAS_BOOKINGS');
        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test('deletes an own pet with no bookings and returns it', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [petRow()], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 })
            .mockResolvedValueOnce({ rows: [], rowCount: 1 });
        const r = await request(app).delete('/api/pets/3').set(customerAuth());
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ id: 3, ownerId: 2, name: 'Lucky', species: 'dog', breed: 'Shiba', weightKg: 8, notes: null });
        expect(pool.query.mock.calls[2][0]).toMatch(/DELETE FROM pets/);
        expect(pool.query.mock.calls[2][1]).toEqual(['3', 2]);
    });

    test('maps a foreign-key race to 409 PET_HAS_BOOKINGS', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [petRow()], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 })
            .mockRejectedValueOnce(Object.assign(new Error('fk'), { code: '23503' }));
        const r = await request(app).delete('/api/pets/3').set(customerAuth());
        expect(r.status).toBe(409);
        expect(r.body.code).toBe('PET_HAS_BOOKINGS');
    });
});
