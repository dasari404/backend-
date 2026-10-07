const express = require('express');
const router = express.Router();
const places = require('../data/places');

// GET /api/places — list all (optional ?type= filter: open|busy|closed|gem)
router.get('/', (req, res) => {
  const { type } = req.query;
  const result = type ? places.filter(p => p.type === type) : places;
  res.json(result);
});

// GET /api/places/:id — single place
router.get('/:id', (req, res) => {
  const place = places.find(p => p.id === parseInt(req.params.id, 10));
  if (!place) return res.status(404).json({ error: 'Place not found' });
  res.json(place);
});

module.exports = router;
