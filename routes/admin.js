const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getDashboard, listCustomers, listGuides, verifyGuide, listBookings, updateBookingStatus
} = require('../controllers/adminController');

router.use(authenticate, requireRole('admin'));

router.get('/dashboard',              getDashboard);
router.get('/customers',              listCustomers);
router.get('/guides',                 listGuides);
router.put('/guides/:id/verify',      verifyGuide);
router.get('/bookings',               listBookings);
router.put('/bookings/:id/status',    updateBookingStatus);

module.exports = router;
