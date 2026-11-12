const router = require('express').Router();
const pool = require('../../../../db');
const { auth, staff } = require('../../../middleware');
const { fail, id } = require('../../../helpers');
const { service, parseServiceInput } = require('../serviceFields');

const SERVICE_HAS_BOOKINGS_MSG = 'ลบไม่ได้ เพราะบริการนี้มีประวัติการจองแล้ว ใช้ปิดบริการแทน';

// Partial update. Services that were ever booked cannot be deleted (bookings reference them): set active=false instead.
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

// Only services that were never booked (any status, cancelled included) can be deleted;
// booked ones stay for the booking history and should be retired with active=false.
router.delete('/staff/services/:serviceId', auth, staff, async (req, res, next) => {
  try {
    const serviceId = id(req.params.serviceId);
    if (!serviceId) return fail(res, 400, 'INVALID_INPUT', 'รหัสบริการไม่ถูกต้อง');

    const found = (await pool.query('SELECT * FROM services WHERE id=$1', [serviceId])).rows[0];
    if (!found) return fail(res, 404, 'NOT_FOUND', 'ไม่พบบริการ');

    const booked = await pool.query('SELECT 1 FROM bookings WHERE service_id=$1 LIMIT 1', [serviceId]);
    if (booked.rowCount) return fail(res, 409, 'SERVICE_HAS_BOOKINGS', SERVICE_HAS_BOOKINGS_MSG);

    await pool.query('DELETE FROM services WHERE id=$1', [serviceId]);
    res.json(service(found));
  } catch (e) {
    // A booking created between the check and the delete trips the bookings.service_id foreign key.
    if (e.code === '23503') return fail(res, 409, 'SERVICE_HAS_BOOKINGS', SERVICE_HAS_BOOKINGS_MSG);
    next(e);
  }
});

module.exports = router;
