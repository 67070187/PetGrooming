const router = require('express').Router();
const pool = require('../../../db');
const { auth, staff } = require('../../middleware');
const { pet } = require('../../helpers');

// Admin: list every pet with its owner's name (lets the UI show names instead of #petId).
router.get('/staff/pets', auth, staff, async (req, res, next) => {
  try {
    const q = await pool.query(
      `SELECT p.*, u.name AS owner_name
         FROM pets p
         JOIN users u ON u.id = p.owner_id
        ORDER BY p.id`
    );
    res.json(q.rows.map((r) => ({ ...pet(r), ownerName: r.owner_name })));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
