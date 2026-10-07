require('dotenv').config();
const express = require('express');
const path    = require('path');

// ── Init DB (connects + seeds admin) ─────────────────────────
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());

// ── Serve frontend ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/customer',    require('./routes/customer'));
app.use('/api/guide',       require('./routes/guide'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/bookings',    require('./routes/bookings'));
app.use('/api/reviews',     require('./routes/reviews'));
app.use('/api/search',      require('./routes/search'));

// ── Legacy public data routes (map, experiences, scam alerts) ─
app.use('/api/guides',      require('./routes/guides'));
app.use('/api/experiences', require('./routes/experiences'));
app.use('/api/places',      require('./routes/places'));
app.use('/api/scam-alerts', require('./routes/scamAlerts'));

// ── Health ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Fallback → frontend ───────────────────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Route not found' });
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ TravelSphere running → http://localhost:${PORT}`);
  console.log(`   Frontend  → http://localhost:${PORT}`);
  console.log(`   API       → http://localhost:${PORT}/api`);
  console.log(`   Admin     → http://localhost:${PORT}/admin`);
});
