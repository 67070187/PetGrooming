const router = require('express').Router();
const pool = require('../../../db');
const { auth, staff } = require('../../middleware');
const { fail, id, dateOk, localStart, booking } = require('../../helpers');

router.get('/staff/bookings', auth, staff, async (req, res, next) => {
  try {
    if (!dateOk(req.query.date)) return fail(res, 400, 'INVALID_INPUT', 'วันที่ไม่ถูกต้อง');
    const start = localStart(req.query.date, '00:00');
    const end = new Date(start.getTime() + 86400000);
    const q = await pool.query('SELECT * FROM bookings WHERE start_at >= $1 AND start_at < $2 ORDER BY start_at', [start, end]);
    res.json(q.rows.map(booking));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
