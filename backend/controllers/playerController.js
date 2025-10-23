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
  },

  async testSportsRadar(req, res) {
    try {
      const player = await playerService.fetchAndCachePlayer('11cad59d-90dd-449c-a839-dddaba4fe16c');
      res.json({ success: true, data: player });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  // services/playerService.js - Update the transformAndCachePlayer function
async transformAndCachePlayer(apiData) {
  // Transform SportsRadar API response to our schema
  const player = await prisma.player.create({
    data: {
      externalId: apiData.id,
      name: apiData.name,
      position: apiData.position,
      team: apiData.team?.name || 'Unknown',
      jerseyNumber: parseInt(apiData.jersey) || null, // ← Fix: use 'jersey' not 'jersey_number'
      height: apiData.height ? `${apiData.height}` : null, // ← Convert to string
      weight: apiData.weight || null,
      college: apiData.college || null,
      experience: apiData.experience || null,
      // Don't create stats yet - we'll fix that separately
      // stats: apiData.seasons ? {
      //   create: this.transformStats(apiData.seasons)
      // } : undefined
    },
    include: {
      stats: true
    }
  });

  return player;
}
};

module.exports = PlayerController;