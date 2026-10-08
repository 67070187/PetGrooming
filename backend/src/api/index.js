// Mounted at /api by app.js. One router file per resource, paths match docs/API_SPEC.yaml.
const router = require('express').Router();

router.use(require('./health/route'));
router.use(require('./auth/register/route'));
router.use(require('./auth/login/route'));
router.use(require('./pets/route'));
router.use(require('./services/route'));
router.use(require('./availability/route'));
router.use(require('./bookings/route'));
router.use(require('./bookings/{bookingId}/cancel/route'));
router.use(require('./staff/bookings/route'));
router.use(require('./staff/bookings/{bookingId}/status/route'));
router.use(require('./staff/customers/route'));
router.use(require('./staff/pets/route'));
router.use(require('./staff/services/route'));
router.use(require('./staff/services/{serviceId}/route'));

module.exports = router;
