const router = require('express').Router();
const pool = require('../../db');
const { auth } = require('../middleware');
const { fail, id, dateOk, timeOk, localStart, booking } = require('../helpers');

router.get('/bookings', auth, async (req, res, next) => {
  try {
    const q = await pool.query('SELECT * FROM bookings WHERE customer_id=$1 ORDER BY start_at DESC', [req.user.id]);
    res.json(q.rows.map(booking));
  } catch (e) {
    next(e);
  }
});

router.post('/bookings', auth, async (req, res, next) => {
  try {
    const { petId, serviceId, date, startTime } = req.body || {};
    if (!id(petId) || !id(serviceId) || !dateOk(date) || !timeOk(startTime)) {
      return fail(res, 400, 'INVALID_INPUT', 'ข้อมูลการจองไม่ถูกต้อง');
    }
    const start = localStart(date, startTime);
    if (start <= new Date()) return fail(res, 400, 'PAST_TIME', 'ไม่สามารถจองเวลาในอดีต');

    const pet = (await pool.query('SELECT owner_id FROM pets WHERE id=$1', [petId])).rows[0];
    if (!pet) return fail(res, 404, 'NOT_FOUND', 'ไม่พบสัตว์เลี้ยง');
    if (Number(pet.owner_id) !== req.user.id) return fail(res, 403, 'FORBIDDEN', 'ไม่ใช่สัตว์เลี้ยงของคุณ');

    const service = (await pool.query('SELECT * FROM services WHERE id=$1 AND active=true', [serviceId])).rows[0];
    if (!service) return fail(res, 404, 'NOT_FOUND', 'ไม่พบบริการ');

    const [hh, mm] = startTime.split(':').map(Number);
    if (hh * 60 + mm < 540 || hh * 60 + mm + service.duration_minutes > 1080) {
      return fail(res, 400, 'OUTSIDE_HOURS', 'เวลานอกเวลาทำการ');
    }

    // end time and price are always derived server-side; overlap is enforced by the DB exclusion constraint
    const end = new Date(start.getTime() + service.duration_minutes * 60000);
    const q = await pool.query(
      'INSERT INTO bookings(customer_id,pet_id,service_id,start_at,end_at,price_thb) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user.id, petId, serviceId, start, end, service.price_thb]
    );
    res.status(201).json(booking(q.rows[0]));
  } catch (e) {
    if (e.code === '23P01') return fail(res, 409, 'SLOT_UNAVAILABLE', 'ช่วงเวลานี้มีการจองแล้ว');
    next(e);
  }
});

module.exports = router;
