// services/playerService.js
const { PrismaClient } = require('@prisma/client');
const sportsRadarAPI = require('./apiService');
const prisma = new PrismaClient();

const PlayerService = {
  async searchPlayers(name) {
    try {
      // 1. First check database cache
      const cachedPlayers = await prisma.player.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        },
        include: {
          stats: {
            orderBy: { season: 'desc' },
            take: 1
          }
        }
      });

      // 2. If found in cache, return cached data
      if (cachedPlayers.length > 0) {
        console.log('Returning cached players');
        return cachedPlayers;
      }

      // 3. If not in cache, we need to figure out search
      // For now, return empty until we get search endpoint
      console.log('No cached players found, but need search endpoint');
      return [];

    } catch (error) {
      console.error('Error searching players:', error);
      throw new Error('Database search failed');
    }
  },

  // New method to fetch and cache player from SportsRadar
  async fetchAndCachePlayer(playerId) {
    try {
      // 1. Check if already cached
      const existingPlayer = await prisma.player.findUnique({
        where: { externalId: playerId },
        include: { stats: true }
      });

      if (existingPlayer) {
        return existingPlayer;
      }

      // 2. Fetch from SportsRadar API
      const playerData = await sportsRadarAPI.getPlayerById(playerId);
      
      // 3. Transform and cache in database
      const cachedPlayer = await this.transformAndCachePlayer(playerData);
      
      return cachedPlayer;

    } catch (error) {
      console.error('Error fetching from SportsRadar:', error);
      throw error;
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
},

  transformStats(seasons) {
    // Transform SportsRadar season stats to our schema
    // This will depend on the actual API response structure
    return seasons.map(season => ({
      season: season.year,
      // Map API stat fields to our schema
      // You'll need to adjust based on actual API response
      passingYards: season.passing?.yards || null,
      passingTouchdowns: season.passing?.touchdowns || null,
      // Add other stat mappings as needed
    }));
  }
};

module.exports = PlayerService;