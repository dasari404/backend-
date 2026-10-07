const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { createBooking, getBookingByToken, completeBooking } = require('../controllers/bookingController');

router.use(authenticate);

// Customer only
router.post('/', requireRole('customer'), createBooking);

// Customer, guide, or admin
router.get('/:token',           getBookingByToken);
router.post('/:token/complete', requireRole('guide','admin'), completeBooking);

module.exports = router;
