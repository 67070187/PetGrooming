const router = require('express').Router();
const pool = require('../../db');
const { auth } = require('../middleware');
const { fail, pet } = require('../helpers');

router.get('/pets', auth, async (req, res, next) => {
  try {
    const q = await pool.query('SELECT * FROM pets WHERE owner_id=$1 ORDER BY id', [req.user.id]);
    res.json(q.rows.map(pet));
  } catch (e) {
    next(e);
  }
});

router.post('/pets', auth, async (req, res, next) => {
  try {
    const { name, species, breed = null, weightKg, notes = null } = req.body || {};
    if (
      typeof name !== 'string' || !name.trim() || name.trim().length > 100 ||
      !['dog', 'cat'].includes(species) ||
      !Number.isFinite(Number(weightKg)) || Number(weightKg) <= 0 || Number(weightKg) > 9999 ||
      (breed !== null && (typeof breed !== 'string' || breed.length > 100)) ||
      (notes !== null && (typeof notes !== 'string' || notes.length > 1000))
    ) {
      return fail(res, 400, 'INVALID_INPUT', 'ข้อมูลสัตว์เลี้ยงไม่ถูกต้อง');
    }
    const q = await pool.query(
      'INSERT INTO pets(owner_id,name,species,breed,weight_kg,notes) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user.id, name.trim(), species, breed, weightKg, notes]
    );
    res.status(201).json(pet(q.rows[0]));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
