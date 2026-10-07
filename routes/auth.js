const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const { customerRegister, guideRegister, login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const pwRules = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');
const emailRules = body('email').isEmail().withMessage('Valid email required');

// POST /api/auth/register/customer
router.post('/register/customer', [
  emailRules,
  pwRules,
  body('full_name').notEmpty().withMessage('Full name required'),
  body('mobile').notEmpty().withMessage('Mobile required'),
], customerRegister);

// POST /api/auth/register/guide
router.post('/register/guide', [
  emailRules,
  pwRules,
  body('full_name').notEmpty().withMessage('Full name required'),
  body('mobile').notEmpty().withMessage('Mobile required'),
], guideRegister);

// POST /api/auth/login
router.post('/login', [emailRules, pwRules], login);

// GET /api/auth/me
router.get('/me', authenticate, me);

module.exports = router;
