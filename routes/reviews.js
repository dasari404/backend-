const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/reviews — Customer submits a review for a completed booking
router.post('/', authenticate, requireRole('customer'), async (req, res) => {
  const { booking_id, rating, comment } = req.body;
  if (!booking_id || !rating) return res.status(400).json({ error: 'booking_id and rating are required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

  // Confirm booking belongs to this customer and is completed
  const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const [[booking]] = await pool.query(
    "SELECT id, guide_id, status FROM bookings WHERE id = ? AND customer_id = ?",
    [booking_id, customer.id]
  );
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'completed') return res.status(400).json({ error: 'Can only review completed bookings' });

  // Check no duplicate review
  const [[existing]] = await pool.query('SELECT id FROM reviews WHERE booking_id = ?', [booking_id]);
  if (existing) return res.status(409).json({ error: 'You have already reviewed this booking' });

  await pool.query(
    'INSERT INTO reviews (booking_id, customer_id, guide_id, rating, comment) VALUES (?,?,?,?,?)',
    [booking_id, customer.id, booking.guide_id, rating, comment || null]
  );

  // Update guide's average rating
  const [[stats]] = await pool.query(
    'SELECT AVG(rating) AS avg_rating, COUNT(*) AS review_count FROM reviews WHERE guide_id = ?',
    [booking.guide_id]
  );
  await pool.query(
    'UPDATE guides SET rating = ?, review_count = ? WHERE id = ?',
    [parseFloat(stats.avg_rating).toFixed(2), stats.review_count, booking.guide_id]
  );

  res.status(201).json({ message: 'Review submitted successfully' });
});

// GET /api/reviews/guide/:guideId — Public: get all reviews for a guide
router.get('/guide/:guideId', async (req, res) => {
  const [reviews] = await pool.query(`
    SELECT r.rating, r.comment, r.created_at, c.full_name AS customer_name
    FROM reviews r
    JOIN customers c ON c.id = r.customer_id
    WHERE r.guide_id = ?
    ORDER BY r.created_at DESC`, [req.params.guideId]);
  res.json(reviews);
});

module.exports = router;
