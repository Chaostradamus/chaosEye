// routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Player search and retrieval
router.get('/search', playerController.searchPlayers);
router.get('/:id', playerController.getPlayerById);

// SportsRadar API testing
router.get('/test/sportsradar', playerController.testSportsRadar);

// 👇 NEW: Cache management
router.get('/cache/rebuild', playerController.rebuildPlayerCache);

module.exports = router;