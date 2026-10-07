const express = require('express');
const router = express.Router();
const experiences = require('../data/experiences');

// GET /api/experiences — list all (optional ?category= filter)
router.get('/', (req, res) => {
  const { category } = req.query;
  const result = category
    ? experiences.filter(e => e.category === category)
    : experiences;
  res.json(result);
});

// GET /api/experiences/:id — single experience
router.get('/:id', (req, res) => {
  const exp = experiences.find(e => e.id === parseInt(req.params.id, 10));
  if (!exp) return res.status(404).json({ error: 'Experience not found' });
  res.json(exp);
});

module.exports = router;
