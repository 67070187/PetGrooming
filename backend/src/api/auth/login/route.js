const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../../db');
const { fail } = require('../../helpers');

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(res, 401, 'INVALID_CREDENTIALS', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    const q = await pool.query('SELECT * FROM users WHERE email=$1', [email.trim().toLowerCase()]);
    const u = q.rows[0];
    if (!u || !(await bcrypt.compare(password, u.password_hash))) {
      return fail(res, 401, 'INVALID_CREDENTIALS', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    const user = { id: Number(u.id), name: u.name, email: u.email, role: u.role };
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
