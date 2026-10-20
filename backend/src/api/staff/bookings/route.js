const router = require('express').Router();
const pool = require('../../../db');
const { auth, staff } = require('../../middleware');
const { fail, dateOk, localStart, bangkok } = require('../../helpers');

function mapBooking(b) {
  const a = bangkok(new Date(b.start_at));
  const z = bangkok(new Date(b.end_at));
  return {
    id: Number(b.id),
    customerId: Number(b.customer_id),
    customerName: b.customer_name,
    customerEmail: b.customer_email,
    petId: Number(b.pet_id),
    petName: b.pet_name,
    petSpecies: b.pet_species,
    serviceId: Number(b.service_id),
    serviceName: b.service_name,
    date: `${a.year}-${a.month}-${a.day}`,
    startTime: `${a.hour}:${a.minute}`,
    endTime: `${z.hour}:${z.minute}`,
    priceThb: Number(b.price_thb),
    status: b.status,
  };
}

router.get('/staff/bookings', auth, staff, async (req, res, next) => {
  try {
    const values = [];
    let where = '';
    // Optional date filter. Without ?date=YYYY-MM-DD, return every booking.
    if (req.query.date !== undefined) {
      if (!dateOk(req.query.date)) return fail(res, 400, 'INVALID_INPUT', 'วันที่ไม่ถูกต้อง');
      const start = localStart(req.query.date, '00:00');
      const end = new Date(start.getTime() + 86400000);
      values.push(start, end);
      where = 'WHERE b.start_at >= $1 AND b.start_at < $2';
    }

    const q = await pool.query(
      `SELECT b.*, u.name AS customer_name, u.email AS customer_email,
              p.name AS pet_name, p.species AS pet_species, s.name AS service_name
         FROM bookings b
         JOIN users u ON u.id = b.customer_id
         JOIN pets p ON p.id = b.pet_id
         JOIN services s ON s.id = b.service_id
         ${where}
        ORDER BY b.start_at DESC, b.id DESC`,
      values
    );
    res.json(q.rows.map(mapBooking));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
