const pool = require('../config/db');

async function getProfile(req, res) {
  const [[guide]] = await pool.query('SELECT * FROM guides WHERE user_id=?', [req.user.id]);
  if (!guide) return res.status(404).json({ error: 'Guide profile not found' });
  res.json(guide);
}

async function saveOnboardingStep(req, res) {
  const step = parseInt(req.params.step, 10);
  const [[guide]] = await pool.query('SELECT id, daily_rate FROM guides WHERE user_id=?', [req.user.id]);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });

  const allowed = {
    1: ['full_name','mobile'],
    2: ['city','state','location_code'],
    3: ['languages','experience_years','bio','specializations'],
    4: ['govt_id_type','govt_id_number'],
    5: ['daily_rate','availability','avatar_url'],
  };

  if (step === 6) {
    const [[g]] = await pool.query('SELECT daily_rate FROM guides WHERE id=?', [guide.id]);
    let level = 'Starter';
    if (g.daily_rate >= 3500) level = 'Premium';
    else if (g.daily_rate >= 2000) level = 'Professional';
    else if (g.daily_rate >= 1000) level = 'Standard';
    await pool.query(
      `UPDATE guides SET onboarding_complete=1, onboarding_step=6, guide_level=?, verification_status='pending' WHERE id=?`,
      [level, guide.id]
    );
    return res.json({ message: 'Onboarding complete — pending admin verification' });
  }

  if (!allowed[step]) return res.status(400).json({ error: 'Invalid step' });
  const fields = allowed[step].filter(f => req.body[f] !== undefined);
  if (!fields.length) return res.status(400).json({ error: 'No valid fields provided' });

  const setClause = fields.map(f => `${f}=?`).join(', ');
  const values    = fields.map(f => {
    const v = req.body[f];
    return typeof v === 'object' ? JSON.stringify(v) : v;
  });
  await pool.query(`UPDATE guides SET ${setClause}, onboarding_step=? WHERE id=?`, [...values, step, guide.id]);
  res.json({ message: `Step ${step} saved`, step });
}

async function getBookings(req, res) {
  const [[guide]] = await pool.query('SELECT id FROM guides WHERE user_id=?', [req.user.id]);
  if (!guide) return res.status(404).json({ error: 'Not found' });

  const [bookings] = await pool.query(`
    SELECT b.*, c.full_name AS customer_name, c.customer_token, c.mobile AS customer_mobile
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    WHERE b.guide_id=?
    ORDER BY b.start_date DESC`, [guide.id]);
  res.json(bookings);
}

async function getTravelHistory(req, res) {
  const [[guide]] = await pool.query('SELECT id FROM guides WHERE user_id=?', [req.user.id]);
  if (!guide) return res.status(404).json({ error: 'Not found' });

  const [records] = await pool.query(`
    SELECT tr.*, c.full_name AS customer_name, c.customer_token
    FROM travel_records tr
    JOIN customers c ON c.id = tr.customer_id
    WHERE tr.guide_id=?
    ORDER BY tr.start_datetime DESC`, [guide.id]);
  res.json(records);
}

async function listPublicGuides(req, res) {
  const { city, language, min_rate, max_rate, min_rating, level } = req.query;
  let sql = `SELECT id, guide_token, full_name, city, state, languages, experience_years,
                    bio, specializations, avatar_url, daily_rate, guide_level,
                    rating, review_count
             FROM guides WHERE verification_status='approved'`;
  const params = [];

  if (city)       { sql += ' AND city LIKE ?';          params.push(`%${city}%`); }
  if (language)   { sql += ' AND languages LIKE ?';     params.push(`%${language}%`); }
  if (min_rate)   { sql += ' AND daily_rate >= ?';      params.push(Number(min_rate)); }
  if (max_rate)   { sql += ' AND daily_rate <= ?';      params.push(Number(max_rate)); }
  if (min_rating) { sql += ' AND rating >= ?';          params.push(Number(min_rating)); }
  if (level)      { sql += ' AND guide_level = ?';      params.push(level); }

  sql += ' ORDER BY rating DESC, review_count DESC';
  const [guides] = await pool.query(sql, params);
  res.json(guides);
}

module.exports = { getProfile, saveOnboardingStep, getBookings, getTravelHistory, listPublicGuides };
