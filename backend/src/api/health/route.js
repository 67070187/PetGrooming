const router = require('express').Router();
const pool = require('../../db');
const { fail } = require('../helpers');

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    fail(res, 503, 'DATABASE_UNAVAILABLE', 'Database ไม่พร้อม');
  }
});

module.exports = router;
