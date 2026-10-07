const router = require('express').Router();
const pool = require('../../../../db');
const { auth } = require('../../../middleware');
const { fail, id, booking } = require('../../../helpers');

router.post('/bookings/:bookingId/cancel', auth, async (req, res, next) => {
  try {
    if (!id(req.params.bookingId)) return fail(res, 400, 'INVALID_INPUT', 'รหัสการจองไม่ถูกต้อง');
    const q = await pool.query(
      "UPDATE bookings SET status='cancelled',updated_at=now() WHERE id=$1 AND customer_id=$2 AND status='confirmed' AND start_at>now() RETURNING *",
      [req.params.bookingId, req.user.id]
    );
    if (q.rowCount) return res.json(booking(q.rows[0]));

    const old = await pool.query('SELECT customer_id FROM bookings WHERE id=$1', [req.params.bookingId]);
    if (!old.rowCount) return fail(res, 404, 'NOT_FOUND', 'ไม่พบรายการจอง');
    if (Number(old.rows[0].customer_id) !== req.user.id) return fail(res, 403, 'FORBIDDEN', 'ไม่ใช่รายการจองของคุณ');
    return fail(res, 409, 'INVALID_STATUS', 'ไม่สามารถยกเลิกรายการนี้');
  } catch (e) {
    next(e);
  }
});

module.exports = router;
