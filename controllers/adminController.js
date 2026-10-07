const pool = require('../config/db');

async function getDashboard(req, res) {
  const [[{ totalCustomers }]]    = await pool.query('SELECT COUNT(*) AS totalCustomers FROM customers');
  const [[{ totalGuides }]]       = await pool.query('SELECT COUNT(*) AS totalGuides FROM guides');
  const [[{ pendingGuides }]]     = await pool.query("SELECT COUNT(*) AS pendingGuides FROM guides WHERE verification_status='pending'");
  const [[{ approvedGuides }]]    = await pool.query("SELECT COUNT(*) AS approvedGuides FROM guides WHERE verification_status='approved'");
  const [[{ totalBookings }]]     = await pool.query('SELECT COUNT(*) AS totalBookings FROM bookings');
  const [[{ activeBookings }]]    = await pool.query("SELECT COUNT(*) AS activeBookings FROM bookings WHERE status IN ('pending','confirmed','ongoing')");
  const [[{ completedBookings }]] = await pool.query("SELECT COUNT(*) AS completedBookings FROM bookings WHERE status='completed'");
  const [[{ totalRevenue }]]      = await pool.query("SELECT IFNULL(SUM(amount),0) AS totalRevenue FROM bookings WHERE status='completed'");

  const [recentActivity] = await pool.query(`
    SELECT al.action, al.entity, al.entity_id, al.created_at, u.email, u.role
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC LIMIT 20`);

  res.json({
    stats: { totalCustomers, totalGuides, pendingGuides, approvedGuides, totalBookings, activeBookings, completedBookings, totalRevenue },
    recentActivity,
  });
}

async function listCustomers(req, res) {
  const { q, page=1, limit=20 } = req.query;
  const offset = (page-1)*limit;
  let sql = `SELECT c.*, u.email, u.is_verified FROM customers c JOIN users u ON u.id=c.user_id`;
  const params = [];
  if (q) {
    sql += ` WHERE c.customer_token LIKE ? OR c.full_name LIKE ? OR c.mobile LIKE ? OR u.email LIKE ?`;
    const like = `%${q}%`;
    params.push(like,like,like,like);
  }
  sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [[{total}]] = await pool.query('SELECT COUNT(*) AS total FROM customers');
  const [data]      = await pool.query(sql, params);
  res.json({ total, page: Number(page), data });
}

async function listGuides(req, res) {
  const { q, status, page=1, limit=20 } = req.query;
  const offset = (page-1)*limit;
  let sql = `SELECT g.*, u.email FROM guides g JOIN users u ON u.id=g.user_id WHERE 1=1`;
  const params = [];
  if (q) {
    sql += ` AND (g.guide_token LIKE ? OR g.full_name LIKE ? OR g.city LIKE ? OR u.email LIKE ?)`;
    const like = `%${q}%`;
    params.push(like,like,like,like);
  }
  if (status) { sql += ` AND g.verification_status=?`; params.push(status); }
  sql += ` ORDER BY g.created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [[{total}]] = await pool.query('SELECT COUNT(*) AS total FROM guides');
  const [data]      = await pool.query(sql, params);
  res.json({ total, page: Number(page), data });
}

async function verifyGuide(req, res) {
  const { id }    = req.params;
  const { action, admin_notes } = req.body;
  if (!['approve','reject'].includes(action)) return res.status(400).json({ error: 'action must be approve or reject' });

  const status = action === 'approve' ? 'approved' : 'rejected';
  const [result] = await pool.query(
    'UPDATE guides SET verification_status=?, admin_notes=? WHERE id=?',
    [status, admin_notes||null, id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Guide not found' });

  if (status === 'approved') {
    const [[guide]] = await pool.query('SELECT user_id FROM guides WHERE id=?', [id]);
    await pool.query('UPDATE users SET is_verified=1 WHERE id=?', [guide.user_id]);
  }
  await pool.query('INSERT INTO audit_logs (user_id,action,entity,entity_id) VALUES (?,?,?,?)',
    [req.user.id, `guide_${status}`, 'guide', String(id)]);

  res.json({ message: `Guide ${status}` });
}

async function listBookings(req, res) {
  const { q, status, page=1, limit=20 } = req.query;
  const offset = (page-1)*limit;
  let sql = `
    SELECT b.*, c.full_name AS customer_name, c.customer_token,
           g.full_name AS guide_name, g.guide_token
    FROM bookings b
    JOIN customers c ON c.id=b.customer_id
    JOIN guides g ON g.id=b.guide_id
    WHERE 1=1`;
  const params = [];
  if (q) {
    sql += ` AND (b.booking_token LIKE ? OR c.full_name LIKE ? OR g.full_name LIKE ? OR b.destination LIKE ?)`;
    const like = `%${q}%`;
    params.push(like,like,like,like);
  }
  if (status) { sql += ` AND b.status=?`; params.push(status); }
  sql += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [[{total}]] = await pool.query('SELECT COUNT(*) AS total FROM bookings');
  const [data]      = await pool.query(sql, params);
  res.json({ total, page: Number(page), data });
}

async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['pending','confirmed','ongoing','completed','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const [result] = await pool.query('UPDATE bookings SET status=? WHERE id=?', [status, id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Booking not found' });

  await pool.query('INSERT INTO audit_logs (user_id,action,entity,entity_id) VALUES (?,?,?,?)',
    [req.user.id, `booking_${status}`, 'booking', String(id)]);
  res.json({ message: `Booking updated to ${status}` });
}

module.exports = { getDashboard, listCustomers, listGuides, verifyGuide, listBookings, updateBookingStatus };
