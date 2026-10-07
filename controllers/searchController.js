const pool = require('../config/db');

async function search(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.status(400).json({ error: 'Query must be at least 2 characters' });

  const term = q.trim();
  const like = `%${term}%`;
  const results = { customers: [], guides: [], bookings: [], travelRecords: [] };

  if (/^CUS-/i.test(term)) {
    [results.customers] = await pool.query(
      'SELECT customer_token,full_name,mobile,onboarding_complete FROM customers WHERE UPPER(customer_token)=UPPER(?)', [term]);
  } else if (/^GUI-/i.test(term)) {
    [results.guides] = await pool.query(
      'SELECT guide_token,full_name,city,state,daily_rate,guide_level,rating,verification_status FROM guides WHERE UPPER(guide_token)=UPPER(?)', [term]);
  } else if (/^BKG-/i.test(term)) {
    [results.bookings] = await pool.query(`
      SELECT b.booking_token,b.destination,b.start_date,b.end_date,b.status,b.amount,
             c.full_name AS customer_name, g.full_name AS guide_name
      FROM bookings b JOIN customers c ON c.id=b.customer_id JOIN guides g ON g.id=b.guide_id
      WHERE UPPER(b.booking_token)=UPPER(?)`, [term]);
  } else if (/^TRV-/i.test(term)) {
    [results.travelRecords] = await pool.query(`
      SELECT tr.travel_token,tr.destination,tr.start_datetime,tr.end_datetime,tr.status,tr.amount_paid,
             c.full_name AS customer_name, g.full_name AS guide_name
      FROM travel_records tr JOIN customers c ON c.id=tr.customer_id JOIN guides g ON g.id=tr.guide_id
      WHERE UPPER(tr.travel_token)=UPPER(?)`, [term]);
  } else {
    [results.customers] = await pool.query(
      'SELECT customer_token,full_name,mobile,onboarding_complete FROM customers WHERE full_name LIKE ? OR mobile LIKE ? OR customer_token LIKE ? LIMIT 10',
      [like,like,like]);
    [results.guides] = await pool.query(
      'SELECT guide_token,full_name,city,state,daily_rate,guide_level,rating,verification_status FROM guides WHERE full_name LIKE ? OR city LIKE ? OR guide_token LIKE ? LIMIT 10',
      [like,like,like]);
    [results.bookings] = await pool.query(`
      SELECT b.booking_token,b.destination,b.start_date,b.end_date,b.status,
             c.full_name AS customer_name, g.full_name AS guide_name
      FROM bookings b JOIN customers c ON c.id=b.customer_id JOIN guides g ON g.id=b.guide_id
      WHERE b.booking_token LIKE ? OR b.destination LIKE ? OR c.full_name LIKE ? OR g.full_name LIKE ? LIMIT 10`,
      [like,like,like,like]);
  }

  res.json(results);
}

module.exports = { search };
