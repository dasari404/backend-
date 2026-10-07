const express = require('express');
const router = express.Router();
const scamAlerts = require('../data/scamAlerts');

// GET /api/scam-alerts — list all (optional ?severity= filter: danger|warning|ok)
router.get('/', (req, res) => {
  const { severity } = req.query;
  const result = severity
    ? scamAlerts.filter(a => a.severity === severity)
    : scamAlerts;
  res.json(result);
});

// GET /api/scam-alerts/:id
router.get('/:id', (req, res) => {
  const alert = scamAlerts.find(a => a.id === parseInt(req.params.id, 10));
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

module.exports = router;
