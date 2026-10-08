const router = require('express').Router();
const pool = require('../../../../db');
const { auth, staff } = require('../../../middleware');
const { fail, id } = require('../../../helpers');
const { service, parseServiceInput } = require('../serviceFields');

// Partial update. Services are never deleted (bookings reference them): set active=false instead.
// Existing bookings keep their captured price and times, so editing a service is safe.
router.patch('/staff/services/:serviceId', auth, staff, async (req, res, next) => {
  try {
    const serviceId = id(req.params.serviceId);
    const v = parseServiceInput(req.body, { partial: true });
    if (!serviceId || !v) return fail(res, 400, 'INVALID_INPUT', 'ข้อมูลบริการไม่ถูกต้อง');

    // column names come from the fixed whitelist in parseServiceInput, never from the request
    const cols = Object.keys(v);
    const set = cols.map((c, i) => `${c}=$${i + 1}`).join(',');
    const q = await pool.query(
      `UPDATE services SET ${set} WHERE id=$${cols.length + 1} RETURNING *`,
      [...cols.map((c) => v[c]), serviceId]
    );
    if (!q.rowCount) return fail(res, 404, 'NOT_FOUND', 'ไม่พบบริการ');
    res.json(service(q.rows[0]));
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'SERVICE_EXISTS', 'ชื่อบริการนี้ถูกใช้แล้ว');
    next(e);
  }
});

module.exports = router;
