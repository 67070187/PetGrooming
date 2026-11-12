const router = require('express').Router();
const pool = require('../../db');
const { auth } = require('../middleware');
const { fail, id, pet } = require('../helpers');

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

// Only pets that were never booked can be deleted: bookings (any status, cancelled included)
// reference the pet and are kept as the shop's history.
router.delete('/pets/:petId', auth, async (req, res, next) => {
  try {
    if (!id(req.params.petId)) return fail(res, 400, 'INVALID_INPUT', 'รหัสสัตว์เลี้ยงไม่ถูกต้อง');

    const found = (await pool.query('SELECT * FROM pets WHERE id=$1', [req.params.petId])).rows[0];
    if (!found) return fail(res, 404, 'NOT_FOUND', 'ไม่พบสัตว์เลี้ยง');
    if (Number(found.owner_id) !== req.user.id) return fail(res, 403, 'FORBIDDEN', 'ไม่ใช่สัตว์เลี้ยงของคุณ');

    const booked = await pool.query('SELECT 1 FROM bookings WHERE pet_id=$1 LIMIT 1', [req.params.petId]);
    if (booked.rowCount) return fail(res, 409, 'PET_HAS_BOOKINGS', 'ลบไม่ได้ เพราะสัตว์เลี้ยงตัวนี้มีประวัติการจองแล้ว');

    await pool.query('DELETE FROM pets WHERE id=$1 AND owner_id=$2', [req.params.petId, req.user.id]);
    res.json(pet(found));
  } catch (e) {
    // A booking created between the check and the delete trips the bookings.pet_id foreign key.
    if (e.code === '23503') return fail(res, 409, 'PET_HAS_BOOKINGS', 'ลบไม่ได้ เพราะสัตว์เลี้ยงตัวนี้มีประวัติการจองแล้ว');
    next(e);
  }
});

module.exports = router;
