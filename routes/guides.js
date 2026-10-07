const express = require('express');
const router = express.Router();
const guides = require('../data/guides');

// GET /api/guides — list all guides (optional ?location= filter)
router.get('/', (req, res) => {
  const { location } = req.query;
  const result = location
    ? guides.filter(g => g.location.toLowerCase().includes(location.toLowerCase()))
    : guides;
  res.json(result);
});

// GET /api/guides/:id — single guide
router.get('/:id', (req, res) => {
  const guide = guides.find(g => g.id === parseInt(req.params.id, 10));
  if (!guide) return res.status(404).json({ error: 'Guide not found' });
  res.json(guide);
});

module.exports = router;
