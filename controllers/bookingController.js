const pool = require('../config/db');
const { generateBookingToken, generateTravelToken } = require('../services/tokenService');

async function createBooking(req, res) {
  const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id=?', [req.user.id]);
  if (!customer) return res.status(403).json({ error: 'Customer profile required' });

  const { guide_id, destination, start_date, end_date, meeting_point, people, special_requests } = req.body;
  if (!guide_id || !destination || !start_date || !end_date)
    return res.status(400).json({ error: 'guide_id, destination, start_date, end_date required' });

  const [[guide]] = await pool.query('SELECT id, daily_rate, verification_status FROM guides WHERE id=?', [guide_id]);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });
  if (guide.verification_status !== 'approved') return res.status(400).json({ error: 'Guide is not verified yet' });

  const days   = Math.max(1, Math.ceil((new Date(end_date) - new Date(start_date)) / 86400000));
  const amount = days * guide.daily_rate * (people || 1);
  const bookingToken = await generateBookingToken();

  const [result] = await pool.query(`
    INSERT INTO bookings (booking_token,customer_id,guide_id,destination,start_date,end_date,meeting_point,people,amount,special_requests,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,'pending')`,
    [bookingToken, customer.id, guide.id, destination, start_date, end_date, meeting_point||null, people||1, amount, special_requests||null]
  );

  await pool.query('INSERT INTO audit_logs (user_id,action,entity,entity_id) VALUES (?,?,?,?)',
    [req.user.id, 'booking_created', 'booking', String(result.insertId)]);

  res.status(201).json({ message: 'Booking created', bookingToken, amount });
}

async function getBookingByToken(req, res) {
  const [[booking]] = await pool.query(`
    SELECT b.*, c.full_name AS customer_name, c.customer_token, c.mobile AS customer_mobile,
           g.full_name AS guide_name, g.guide_token, g.city AS guide_city, g.mobile AS guide_mobile
    FROM bookings b
    JOIN customers c ON c.id=b.customer_id
    JOIN guides g ON g.id=b.guide_id
    WHERE b.booking_token=?`, [req.params.token]);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (req.user.role === 'customer') {
    const [[cust]] = await pool.query('SELECT id FROM customers WHERE user_id=?', [req.user.id]);
    if (booking.customer_id !== cust?.id) return res.status(403).json({ error: 'Access denied' });
  }
  if (req.user.role === 'guide') {
    const [[g]] = await pool.query('SELECT id FROM guides WHERE user_id=?', [req.user.id]);
    if (booking.guide_id !== g?.id) return res.status(403).json({ error: 'Access denied' });
  }
  res.json(booking);
}

async function completeBooking(req, res) {
  const [[booking]] = await pool.query('SELECT * FROM bookings WHERE booking_token=?', [req.params.token]);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status === 'completed') return res.status(400).json({ error: 'Already completed' });

  const { places_visited, guide_notes, customer_notes } = req.body;
  await pool.query("UPDATE bookings SET status='completed' WHERE id=?", [booking.id]);

  const travelToken = await generateTravelToken();
  await pool.query(`
    INSERT INTO travel_records
      (travel_token,booking_id,customer_id,guide_id,destination,start_datetime,end_datetime,
       meeting_location,places_visited,amount_paid,status,guide_notes,customer_notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,'completed',?,?)`,
    [travelToken, booking.id, booking.customer_id, booking.guide_id,
     booking.destination, booking.start_date, booking.end_date, booking.meeting_point,
     places_visited ? JSON.stringify(places_visited) : null,
     booking.amount, guide_notes||null, customer_notes||null]
  );

  await pool.query('INSERT INTO audit_logs (user_id,action,entity,entity_id) VALUES (?,?,?,?)',
    [req.user.id, 'booking_completed', 'booking', String(booking.id)]);

  res.json({ message: 'Booking completed', travelToken });
}

module.exports = { createBooking, getBookingByToken, completeBooking };
