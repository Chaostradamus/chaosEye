// services/playerCacheService.js
const { PrismaClient } = require('@prisma/client');
const sportsRadarAPI = require('./apiService');
const prisma = new PrismaClient();

const PlayerCacheService = {
  // 👇 OPTIMIZED: Single function that handles everything
  async cacheAllPlayers() {
    try {
      console.log('🚀 Starting optimized player cache...');
      
      // 👇 SINGLE API FLOW: Get teams + rosters together
      const teamsWithRosters = await sportsRadarAPI.getAllTeamsWithRosters();
      
      let totalPlayersCached = 0;
      let totalPlayersProcessed = 0;
      
      console.log(`📊 Processing ${teamsWithRosters.length} teams...`);
      
      // Process all teams and their players
      for (const team of teamsWithRosters) {
        const players = team.players || [];
        console.log(`\n🏈 ${team.market} ${team.name}: ${players.length} players`);
        
        let teamPlayersCached = 0;
        
        // Cache each player in this team
        for (const playerData of players) {
          const wasCached = await this.cacheBasicPlayerInfo(playerData, team);
          if (wasCached) teamPlayersCached++;
          totalPlayersProcessed++;
        }
        
        totalPlayersCached += teamPlayersCached;
        console.log(`   ✅ Cached ${teamPlayersCached} new players`);
      }
      
      console.log(`\n🎉 CACHE COMPLETE!`);
      console.log(`   📥 Processed: ${totalPlayersProcessed} players`);
      console.log(`   💾 Newly Cached: ${totalPlayersCached} players`);
      console.log(`   🗄️  Total in Database: ${await this.getTotalPlayerCount()} players`);
      
      return { 
        totalProcessed: totalPlayersProcessed, 
        totalCached: totalPlayersCached,
        totalInDatabase: await this.getTotalPlayerCount()
      };
      
    } catch (error) {
      console.error('❌ Error caching players:', error);
      throw error;
    }
  },

  // 👇 UPDATED: Returns boolean indicating if player was cached
  async cacheBasicPlayerInfo(playerData, team) {
    try {
      // Check if player already exists
      const existingPlayer = await prisma.player.findUnique({
        where: { externalId: playerData.id }
      });

      if (existingPlayer) {
        return false; // Already cached
      }

      // Create new player record
      await prisma.player.create({
        data: {
          externalId: playerData.id,
          name: playerData.name,
          position: playerData.position,
          team: team.name,
          jerseyNumber: parseInt(playerData.jersey) || null,
          height: playerData.height ? `${playerData.height}` : null,
          weight: playerData.weight || null,
          college: playerData.college || null,
          experience: playerData.experience || null,
        }
      });

      console.log(`      ✅ ${playerData.name} (${playerData.position})`);
      return true; // Successfully cached
      
    } catch (error) {
      console.error(`      ❌ ${playerData.name}: ${error.message}`);
      return false;
    }
  },

  // 👇 NEW: Get total player count in database
  async getTotalPlayerCount() {
    return await prisma.player.count();
  },

  // Search players by name in our cached database
  async searchCachedPlayers(name) {
    try {
      const players = await prisma.player.findMany({
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
      
      console.log(`🔍 Search for "${name}" found ${players.length} cached players`);
      return players;
      
    } catch (error) {
      console.error('Error searching cached players:', error);
      throw error;
    }
  }
};

module.exports = PlayerCacheService;