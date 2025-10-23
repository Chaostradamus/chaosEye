// routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// GET /api/players/search?name=patrick
router.get('/search', playerController.searchPlayers);

// GET /api/players/:id
router.get('/:id', playerController.getPlayerById);

// Test SportsRadar endpoint
router.get('/test/sportsradar', playerController.testSportsRadar);

module.exports = router;