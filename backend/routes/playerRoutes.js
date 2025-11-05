// routes/playerRoutes.js
const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");

router.get("/search", playerController.searchPlayers);
router.get("/search/with-stats", playerController.searchPlayersWithStats);
router.get("/:id", playerController.getPlayerById);
router.get("/:id/stats", playerController.fetchPlayerStats);
router.get("/test/sportsradar", playerController.testSportsRadar);
router.get("/cache/rebuild", playerController.rebuildPlayerCache);
router.get("/debug/:id", playerController.debugPlayer);

module.exports = router;
