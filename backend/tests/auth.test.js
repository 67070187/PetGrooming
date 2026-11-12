process.env.JWT_SECRET = 'test_secret_that_is_at_least_32_characters_long';
jest.mock('../src/db', () => ({ query: jest.fn() }));
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../src/db');
const app = require('../src/app');

beforeEach(() => pool.query.mockReset());

describe('POST /api/auth/register (FR-01)', () => {
  test('creates a customer and stores only a bcrypt hash', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '5', name: 'Ann', email: 'ann@example.com', role: 'customer' }] });

    const r = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ann', email: 'Ann@Example.com', password: 'longenough1', role: 'staff' });

    expect(r.status).toBe(201);
    expect(r.body).toEqual({ id: 5, name: 'Ann', email: 'ann@example.com', role: 'customer' });
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO users\(name,email,password_hash\)/);
    expect(params).toHaveLength(3); // name, email, hash: the requested role is ignored
    expect(params[1]).toBe('ann@example.com');
    expect(params[2]).not.toBe('longenough1');
    expect(await bcrypt.compare('longenough1', params[2])).toBe(true);
  });

  test('short password -> 400 INVALID_INPUT', async () => {
    const r = await request(app).post('/api/auth/register').send({ name: 'Ann', email: 'ann@example.com', password: 'short' });
    expect(r.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('duplicate email -> 409 EMAIL_EXISTS', async () => {
    pool.query.mockRejectedValueOnce(Object.assign(new Error('duplicate key'), { code: '23505' }));
    const r = await request(app).post('/api/auth/register').send({ name: 'Ann', email: 'ann@example.com', password: 'longenough1' });
    expect(r.status).toBe(409);
    expect(r.body.code).toBe('EMAIL_EXISTS');
  });
});

describe('POST /api/auth/login (FR-01)', () => {
  const user = async () => ({
    id: '5',
    name: 'Ann',
    email: 'ann@example.com',
    role: 'customer',
    password_hash: await bcrypt.hash('longenough1', 4),
  });

  test('correct password returns a JWT carrying the user id and role', async () => {
    pool.query.mockResolvedValueOnce({ rows: [await user()] });
    const r = await request(app).post('/api/auth/login').send({ email: 'ANN@example.com', password: 'longenough1' });
    expect(r.status).toBe(200);
    expect(r.body.user).toEqual({ id: 5, name: 'Ann', email: 'ann@example.com', role: 'customer' });
    expect(r.body.user.password_hash).toBeUndefined();
    const claims = jwt.verify(r.body.token, process.env.JWT_SECRET);
    expect(claims).toMatchObject({ id: 5, role: 'customer' });
  });

  test('wrong password and unknown email give the same 401 message', async () => {
    pool.query.mockResolvedValueOnce({ rows: [await user()] });
    const wrong = await request(app).post('/api/auth/login').send({ email: 'ann@example.com', password: 'nope-nope' });
    pool.query.mockResolvedValueOnce({ rows: [] });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'who@example.com', password: 'nope-nope' });

    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  test('a customer token cannot reach staff endpoints', async () => {
    const token = jwt.sign({ id: 5, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const r = await request(app).get('/api/staff/bookings').set('Authorization', `Bearer ${token}`);
    expect(r.status).toBe(403);
  });
});
