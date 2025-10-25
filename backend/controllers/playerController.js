// controllers/playerController.js
const playerService = require('../services/playerService');

const PlayerController = {
  // Search players
  async searchPlayers(req, res) {
    try {
      const { name } = req.query;
      
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ 
          error: 'Search term must be at least 2 characters long' 
        });
      }

      const players = await playerService.searchPlayers(name.trim());
      
      res.json({
        success: true,
        data: players,
        count: players.length
      });
      
    } catch (error) {
      console.error('Search players error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error during search' 
      });
    }
  },

  // Get player by ID
  async getPlayerById(req, res) {
    try {
      const { id } = req.params;
      const player = await playerService.getPlayerById(parseInt(id));
      
      if (!player) {
        return res.status(404).json({ 
          success: false,
          error: 'Player not found' 
        });
      }

      res.json({
        success: true,
        data: player
      });
      
    } catch (error) {
      console.error('Get player error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  // Test SportsRadar connection
  async testSportsRadar(req, res) {
    try {
      const player = await playerService.fetchAndCachePlayer('11cad59d-90dd-449c-a839-dddaba4fe16c');
      res.json({ success: true, data: player });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 👇 UPDATED: Rebuild player cache with detailed response
  async rebuildPlayerCache(req, res) {
    try {
      console.log('🔄 Manual cache rebuild requested...');
      const cacheResult = await playerService.cacheAllPlayers();
      
      res.json({ 
        success: true, 
        message: `Player cache rebuilt successfully!`,
        data: cacheResult
      });
      
    } catch (error) {
      console.error('Cache rebuild error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};

module.exports = PlayerController;