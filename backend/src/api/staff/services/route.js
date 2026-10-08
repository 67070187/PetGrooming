const router = require('express').Router();
const pool = require('../../../db');
const { auth, staff } = require('../../middleware');
const { fail } = require('../../helpers');
const { service, parseServiceInput } = require('./serviceFields');

// Unlike public GET /services, this includes inactive services so staff can re-enable them.
router.get('/staff/services', auth, staff, async (req, res, next) => {
  try {
    const q = await pool.query('SELECT * FROM services ORDER BY id');
    res.json(q.rows.map(service));
  } catch (e) {
    next(e);
  }
});

router.post('/staff/services', auth, staff, async (req, res, next) => {
  try {
    const v = parseServiceInput(req.body, { partial: false });
    if (!v) return fail(res, 400, 'INVALID_INPUT', 'ข้อมูลบริการไม่ถูกต้อง');
    const q = await pool.query(
      'INSERT INTO services(name,duration_minutes,price_thb,active) VALUES($1,$2,$3,$4) RETURNING *',
      [v.name, v.duration_minutes, v.price_thb, v.active ?? true]
    );
    res.status(201).json(service(q.rows[0]));
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'SERVICE_EXISTS', 'ชื่อบริการนี้ถูกใช้แล้ว');
    next(e);
  }
});

module.exports = router;
