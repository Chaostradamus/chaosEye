// controllers/playerController.js
const playerService = require('../services/playerService');

const PlayerController = {
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
  }
};

module.exports = PlayerController;