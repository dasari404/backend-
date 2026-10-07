const jwt  = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'travelsphere_dev_secret_change_in_prod';

// ── Verify JWT and attach user to req ─────────────────────────
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const [[user]] = await pool.query(
      'SELECT id, role, is_verified FROM users WHERE id = ?',
      [payload.userId]
    );
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Role guard factory ────────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

// ── Issue JWT ─────────────────────────────────────────────────
function signToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { authenticate, requireRole, signToken };
