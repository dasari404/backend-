const express = require('express');
const router  = express.Router();
const { search } = require('../controllers/searchController');
// GET /api/search?q=<term>  — public, no auth required
router.get('/', search);
module.exports = router;
