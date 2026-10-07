const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getProfile, saveOnboardingStep, getBookings, getTravelHistory } = require('../controllers/customerController');

router.use(authenticate, requireRole('customer'));

router.get('/profile',          getProfile);
router.put('/onboarding/step/:step', saveOnboardingStep);
router.get('/bookings',         getBookings);
router.get('/travel-history',   getTravelHistory);

module.exports = router;
