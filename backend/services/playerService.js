// services/playerService.js
const { PrismaClient } = require('@prisma/client');
const sportsRadarAPI = require('./apiService');
const playerCacheService = require('./playerCacheService');
const prisma = new PrismaClient();

const PlayerService = {
  // Search players by name
  async searchPlayers(name) {
    try {
      const cachedPlayers = await playerCacheService.searchCachedPlayers(name);
      
      if (cachedPlayers.length > 0) {
        console.log(`🎯 Returning ${cachedPlayers.length} cached players for "${name}"`);
        return cachedPlayers;
      }

      console.log(`❌ No cached players found for "${name}"`);
      return [];
      
    } catch (error) {
      console.error('Error searching players:', error);
      throw new Error('Search failed');
    }
  },

  // 👇 UPDATED: Cache all players (now returns detailed stats)
  async cacheAllPlayers() {
    const result = await playerCacheService.cacheAllPlayers();
    return result;
  },

  // Get player by our database ID
  async getPlayerById(id) {
    return await prisma.player.findUnique({
      where: { id },
      include: { stats: true }
    });
  },

  // Fetch and cache individual player from SportsRadar
  async fetchAndCachePlayer(playerId) {
    try {
      const existingPlayer = await prisma.player.findUnique({
        where: { externalId: playerId },
        include: { stats: true }
      });

      if (existingPlayer) {
        return existingPlayer;
      }

      const playerData = await sportsRadarAPI.getPlayerById(playerId);
      const cachedPlayer = await this.transformAndCachePlayer(playerData);
      
      return cachedPlayer;

    } catch (error) {
      console.error('Error fetching from SportsRadar:', error);
      throw error;
    }
  },

  // Transform and cache player data
  async transformAndCachePlayer(apiData) {
    const player = await prisma.player.create({
      data: {
        externalId: apiData.id,
        name: apiData.name,
        position: apiData.position,
        team: apiData.team?.name || 'Unknown',
        jerseyNumber: parseInt(apiData.jersey) || null,
        height: apiData.height ? `${apiData.height}` : null,
        weight: apiData.weight || null,
        college: apiData.college || null,
        experience: apiData.experience || null,
      },
      include: {
        stats: true
      }
    });

    return player;
  }
};

module.exports = PlayerService;