const router = require('express').Router();
const pool = require('../../../../../db');
const { auth, staff } = require('../../../../middleware');
const { fail, id, dateOk, localStart, booking } = require('../../../../helpers');

// Allowed transitions: confirmed -> in_progress -> completed; confirmed -> cancelled
router.patch('/staff/bookings/:bookingId/status', auth, staff, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!id(req.params.bookingId) || !['in_progress', 'completed', 'cancelled'].includes(status)) {
      return fail(res, 400, 'INVALID_INPUT', 'สถานะไม่ถูกต้อง');
    }
    const previous = status === 'completed' ? 'in_progress' : 'confirmed';
    const q = await pool.query(
      'UPDATE bookings SET status=$1,updated_at=now() WHERE id=$2 AND status=$3 RETURNING *',
      [status, req.params.bookingId, previous]
    );
    if (q.rowCount) return res.json(booking(q.rows[0]));

    const old = await pool.query('SELECT id FROM bookings WHERE id=$1', [req.params.bookingId]);
    return old.rowCount
      ? fail(res, 409, 'INVALID_STATUS', 'เปลี่ยนสถานะนี้ไม่ได้')
      : fail(res, 404, 'NOT_FOUND', 'ไม่พบรายการจอง');
  } catch (e) {
    next(e);
  }
});

module.exports = router;
