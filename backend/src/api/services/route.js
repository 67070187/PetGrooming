const router = require('express').Router();
const pool = require('../../db');

router.get('/services', async (req, res, next) => {
  try {
    const q = await pool.query('SELECT id,name,duration_minutes,price_thb FROM services WHERE active=true ORDER BY id');
    res.json(q.rows.map((s) => ({
      id: Number(s.id),
      name: s.name,
      durationMinutes: s.duration_minutes,
      priceThb: s.price_thb,
    })));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
