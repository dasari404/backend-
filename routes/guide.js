const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getProfile, saveOnboardingStep, getBookings, getTravelHistory, listPublicGuides
} = require('../controllers/guideController');

// Public — no auth needed
router.get('/public', listPublicGuides);

// Protected — guide only
router.use(authenticate, requireRole('guide'));
router.get('/profile',               getProfile);
router.put('/onboarding/step/:step', saveOnboardingStep);
router.get('/bookings',              getBookings);
router.get('/travel-history',        getTravelHistory);

module.exports = router;
