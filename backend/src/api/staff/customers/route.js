const router = require('express').Router();
const pool = require('../../../db');
const { auth, staff } = require('../../middleware');

// FR-07 / admin: list customers with pet and booking counts.
// Never select password_hash; staff accounts are excluded.
router.get('/staff/customers', auth, staff, async (req, res, next) => {
  try {
    const q = await pool.query(
      `SELECT u.id, u.name, u.email,
              (SELECT COUNT(*) FROM pets p WHERE p.owner_id = u.id) AS pet_count,
              (SELECT COUNT(*) FROM bookings b WHERE b.customer_id = u.id) AS booking_count
         FROM users u
        WHERE u.role = 'customer'
        ORDER BY u.id`
    );
    res.json(
      q.rows.map((r) => ({
        id: Number(r.id),
        name: r.name,
        email: r.email,
        petCount: Number(r.pet_count),
        bookingCount: Number(r.booking_count),
      }))
    );
  } catch (e) {
    next(e);
  }
});

module.exports = router;
