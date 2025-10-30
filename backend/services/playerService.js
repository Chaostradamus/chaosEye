// services/playerService.js
const { PrismaClient } = require('@prisma/client');
const sportsRadarAPI = require('./apiService');
const playerCacheService = require('./playerCacheService');
const prisma = new PrismaClient();

const PlayerService = {
  async searchPlayers(name) {
  try {
    const cachedPlayers = await playerCacheService.searchCachedPlayers(name);
    
    if (cachedPlayers.length > 0) {
      console.log(`🎯 Found ${cachedPlayers.length} players for "${name}"`);
      
      const enhancedPlayers = await Promise.all(
        cachedPlayers.map(async (player) => {
          if ((!player.stats || player.stats.length === 0) && player.externalId) {
            try {
              console.log(`📊 Auto-fetching stats for ${player.name}...`);
              return await this.fetchAndCachePlayerStats(player.externalId);
            } catch (error) {
              console.error(`❌ Could not fetch stats for ${player.name}`);
              return player;
            }
          }
          return player;
        })
      );
      
      return enhancedPlayers;
    }

    console.log(`❌ No players found for "${name}"`);
    return [];
    
  } catch (error) {
    console.error('Error searching players:', error);
    throw new Error('Search failed');
  }
},

  async cacheAllPlayers() {
    const result = await playerCacheService.cacheAllPlayers();
    return result;
  },

  async getPlayerById(id) {
    return await prisma.player.findUnique({
      where: { id },
      include: { stats: true }
    });
  },

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
  },

  async fetchAndCachePlayerStats(playerExternalId) {
    try {
      console.log(`📊 Fetching stats for player ${playerExternalId}...`);
      
      const playerData = await sportsRadarAPI.getPlayerById(playerExternalId);
      
      const existingPlayer = await prisma.player.findUnique({
        where: { externalId: playerExternalId },
        include: { stats: true }
      });

      if (!existingPlayer) {
        throw new Error('Player not found in database');
      }

      if (playerData.seasons && playerData.seasons.length > 0) {
        await this.cachePlayerStats(existingPlayer.id, playerData.seasons);
        console.log(`✅ Cached stats for ${existingPlayer.name}`);
      } else {
        console.log(`ℹ️  No season stats available for ${existingPlayer.name}`);
      }

      return await prisma.player.findUnique({
        where: { id: existingPlayer.id },
        include: { stats: { orderBy: { season: 'desc' } } }
      });

    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  },

  async cachePlayerStats(playerId, seasons) {
    try {
      const regularSeasons = seasons.filter(season => season.type === 'REG');
      
      for (const season of regularSeasons) {
        const teamStats = season.teams[0]?.statistics;
        if (!teamStats) continue;

        const passing = teamStats.passing;
        const rushing = teamStats.rushing;
        const receiving = teamStats.receiving;

        const existingStats = await prisma.playerStat.findFirst({
          where: {
            playerId: playerId,
            season: season.year
          }
        });

        if (!existingStats) {
          await prisma.playerStat.create({
            data: {
              playerId: playerId,
              season: season.year,
              passingYards: passing?.yards || null,
              passingTouchdowns: passing?.touchdowns || null,
              interceptions: passing?.interceptions || null,
              rushingYards: rushing?.yards || null,
              rushingTouchdowns: rushing?.touchdowns || null,
              receptions: receiving?.receptions || null,
              receivingYards: receiving?.yards || null,
              receivingTouchdowns: receiving?.touchdowns || null,
              fumbles: teamStats.fumbles?.fumbles || null,
              gamesPlayed: teamStats.games_played || null
            }
          });
        }
      }
    } catch (error) {
      console.error('Error caching player stats:', error);
    }
  }
};

module.exports = PlayerService;