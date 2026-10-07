const router = require('express').Router();
const pool = require('../../db');
const { fail, id, dateOk, localStart } = require('../helpers');

const OPEN = 9 * 60;
const CLOSE = 18 * 60;
const STEP = 30;

router.get('/availability', async (req, res, next) => {
  try {
    const { date, serviceId } = req.query;
    if (!dateOk(date) || !id(serviceId)) return fail(res, 400, 'INVALID_INPUT', 'วันที่หรือบริการไม่ถูกต้อง');

    const s = (await pool.query('SELECT * FROM services WHERE id=$1 AND active=true', [serviceId])).rows[0];
    if (!s) return fail(res, 404, 'NOT_FOUND', 'ไม่พบบริการ');

    const dayOpen = localStart(date, '09:00');
    const dayClose = new Date(dayOpen.getTime() + 9 * 3600000);
    const q = await pool.query(
      "SELECT start_at,end_at FROM bookings WHERE status <> 'cancelled' AND start_at < $2 AND end_at > $1",
      [dayOpen, dayClose]
    );

    const now = new Date();
    const times = [];
    for (let m = OPEN; m < CLOSE; m += STEP) {
      if (m + s.duration_minutes > CLOSE) continue;
      const t = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      const st = localStart(date, t);
      const end = new Date(st.getTime() + s.duration_minutes * 60000);
      if (st <= now) continue;
      if (q.rows.some((b) => st < new Date(b.end_at) && end > new Date(b.start_at))) continue;
      times.push(t);
    }
    res.json({ date, serviceId: Number(serviceId), timezone: 'Asia/Bangkok', availableStartTimes: times });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
