const bcrypt  = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool    = require('../config/db');
const { signToken } = require('../middleware/auth');
const { generateCustomerToken, generateGuideToken } = require('../services/tokenService');

async function customerRegister(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, full_name, mobile, city } = req.body;
  const [[existing]] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash           = bcrypt.hashSync(password, 10);
  const [userResult]   = await pool.query(
    "INSERT INTO users (email,password_hash,role,is_verified) VALUES (?,?,'customer',0)",
    [email, hash]
  );
  const userId         = userResult.insertId;
  const customerToken  = await generateCustomerToken(city || '');

  await pool.query(
    'INSERT INTO customers (user_id,customer_token,full_name,mobile) VALUES (?,?,?,?)',
    [userId, customerToken, full_name, mobile]
  );

  const token = signToken(userId, 'customer');
  res.status(201).json({ token, customerToken, role: 'customer' });
}

async function guideRegister(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, full_name, mobile, city, state } = req.body;
  const [[existing]] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash         = bcrypt.hashSync(password, 10);
  const [userResult] = await pool.query(
    "INSERT INTO users (email,password_hash,role,is_verified) VALUES (?,?,'guide',0)",
    [email, hash]
  );
  const userId     = userResult.insertId;
  const guideToken = await generateGuideToken(city || '');

  await pool.query(
    `INSERT INTO guides (user_id,guide_token,full_name,mobile,city,state,location_code,languages,daily_rate)
     VALUES (?,?,?,?,?,?,'IND','[]',0)`,
    [userId, guideToken, full_name, mobile, city || '', state || '']
  );

  const token = signToken(userId, 'guide');
  res.status(201).json({ token, guideToken, role: 'guide' });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const [[user]] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (!bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user.id, user.role);

  if (user.role === 'customer') {
    const [[c]] = await pool.query(
      'SELECT customer_token, onboarding_complete FROM customers WHERE user_id=?', [user.id]
    );
    return res.json({ token, role: 'customer', portalToken: c?.customer_token, onboardingComplete: c?.onboarding_complete });
  }
  if (user.role === 'guide') {
    const [[g]] = await pool.query(
      'SELECT guide_token, onboarding_complete, verification_status FROM guides WHERE user_id=?', [user.id]
    );
    return res.json({ token, role: 'guide', portalToken: g?.guide_token, onboardingComplete: g?.onboarding_complete, verificationStatus: g?.verification_status });
  }

  res.json({ token, role: 'admin' });
}

async function me(req, res) {
  const [[user]] = await pool.query(
    'SELECT id,email,role,is_verified,created_at FROM users WHERE id=?', [req.user.id]
  );
  if (!user) return res.status(404).json({ error: 'User not found' });

  let profile = null;
  if (user.role === 'customer') {
    [[profile]] = await pool.query('SELECT * FROM customers WHERE user_id=?', [user.id]);
  } else if (user.role === 'guide') {
    [[profile]] = await pool.query('SELECT * FROM guides WHERE user_id=?', [user.id]);
  }
  res.json({ user, profile });
}

module.exports = { customerRegister, guideRegister, login, me };
