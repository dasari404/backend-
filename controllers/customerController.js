const pool = require('../config/db');

async function getProfile(req, res) {
  const [[customer]] = await pool.query('SELECT * FROM customers WHERE user_id=?', [req.user.id]);
  if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
  res.json(customer);
}

async function saveOnboardingStep(req, res) {
  const step = parseInt(req.params.step, 10);
  const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id=?', [req.user.id]);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const allowed = {
    1: ['full_name','mobile'],
    2: ['age_group','nationality','preferred_language','travel_type','budget_range','accessibility_needs'],
    3: ['preferred_destinations','preferred_experiences','food_preferences','travel_style'],
  };

  if (step === 4) {
    await pool.query('UPDATE customers SET onboarding_complete=1, onboarding_step=4 WHERE id=?', [customer.id]);
    return res.json({ message: 'Onboarding complete' });
  }
  if (!allowed[step]) return res.status(400).json({ error: 'Invalid step' });

  const fields  = allowed[step].filter(f => req.body[f] !== undefined);
  if (!fields.length) return res.status(400).json({ error: 'No valid fields provided' });

  const setClause = fields.map(f => `${f}=?`).join(', ');
  const values    = fields.map(f => req.body[f]);
  await pool.query(`UPDATE customers SET ${setClause}, onboarding_step=? WHERE id=?`, [...values, step, customer.id]);
  res.json({ message: `Step ${step} saved`, step });
}

async function getBookings(req, res) {
  const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id=?', [req.user.id]);
  if (!customer) return res.status(404).json({ error: 'Not found' });

  const [bookings] = await pool.query(`
    SELECT b.*, g.full_name AS guide_name, g.guide_token, g.city AS guide_city, g.avatar_url
    FROM bookings b
    JOIN guides g ON g.id = b.guide_id
    WHERE b.customer_id=?
    ORDER BY b.created_at DESC`, [customer.id]);
  res.json(bookings);
}

async function getTravelHistory(req, res) {
  const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id=?', [req.user.id]);
  if (!customer) return res.status(404).json({ error: 'Not found' });

  const [records] = await pool.query(`
    SELECT tr.*, g.full_name AS guide_name, g.guide_token
    FROM travel_records tr
    JOIN guides g ON g.id = tr.guide_id
    WHERE tr.customer_id=?
    ORDER BY tr.start_datetime DESC`, [customer.id]);
  res.json(records);
}

module.exports = { getProfile, saveOnboardingStep, getBookings, getTravelHistory };
