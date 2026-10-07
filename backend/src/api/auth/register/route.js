const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../../../db');
const { fail } = require('../../helpers');

router.post('/auth/register', async (req, res, next) => {
  try {
    let { name, email, password } = req.body || {};
    if (
      typeof name !== 'string' || !name.trim() || name.trim().length > 100 ||
      typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== 'string' || password.length < 8
    ) {
      return fail(res, 400, 'INVALID_INPUT', 'ข้อมูลสมัครสมาชิกไม่ถูกต้อง');
    }
    email = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 12);
    // role is never taken from the request: public registration always creates a customer
    const q = await pool.query(
      'INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role',
      [name.trim(), email, hash]
    );
    res.status(201).json({ ...q.rows[0], id: Number(q.rows[0].id) });
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'EMAIL_EXISTS', 'อีเมลนี้ถูกใช้แล้ว');
    next(e);
  }
});

module.exports = router;
