// services/playerCacheService.js
const { PrismaClient } = require("@prisma/client");
const sportsRadarAPI = require("./apiService");
const prisma = new PrismaClient();

const PlayerCacheService = {
  // Main function to cache all players from all teams
  // services/playerCacheService.js - Update the cacheAllPlayers function

  async cacheAllPlayers() {
    try {
      console.log("🚀 Starting to cache all NFL players...");
      console.log("⏰ Using slower pace to avoid rate limits...");

      const teamsData = await sportsRadarAPI.getAllTeams();
      const teams = teamsData.teams || [];

      console.log(`📋 Found ${teams.length} teams`);

      let totalPlayersCached = 0;
      let teamsProcessed = 0;

      // 👇 SLOWER: Process teams with longer delays
      for (const team of teams) {
        teamsProcessed++;
        console.log(
          `🏈 [${teamsProcessed}/${teams.length}] Caching players for ${team.market} ${team.name}...`
        );

        try {
          const rosterData = await sportsRadarAPI.getTeamRoster(team.id);
          const players = rosterData.players || [];

          console.log(`   📊 Found ${players.length} players`);

          // Cache each player
          for (const playerData of players) {
            await this.cacheBasicPlayerInfo(playerData, team);
            totalPlayersCached++;
          }

          // 👇 INCREASED DELAY: 2 seconds between teams instead of 200ms
          console.log(`   💤 Waiting 2 seconds before next team...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(
            `   ❌ Error caching ${team.name} roster:`,
            error.message
          );

          // 👇 EVEN LONGER DELAY on error (might be rate limited)
          console.log(`   💤 Rate limit hit? Waiting 10 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }

      console.log(`✅ Successfully cached ${totalPlayersCached} players total`);
      return totalPlayersCached;
    } catch (error) {
      console.error("❌ Error caching players:", error);
      throw error;
    }
  },

  // Cache individual player's basic info (without detailed stats)
  async cacheBasicPlayerInfo(playerData, team) {
    try {
      // Check if player already exists in our database
      const existingPlayer = await prisma.player.findUnique({
        where: { externalId: playerData.id },
      });

      if (existingPlayer) {
        console.log(`   ⏩ Already cached: ${playerData.name}`);
        return existingPlayer;
      }

      // Create new player record in our database
      const player = await prisma.player.create({
        data: {
          externalId: playerData.id, // SportsRadar's unique ID
          name: playerData.name, // "Patrick Mahomes"
          position: playerData.position, // "QB", "RB", "WR", etc.
          team: team.name, // "Chiefs"
          jerseyNumber: parseInt(playerData.jersey) || null, // 15
          height: playerData.height ? `${playerData.height}` : null, // "74" (inches)
          weight: playerData.weight || null, // 225 (pounds)
          college: playerData.college || null, // "Texas Tech"
          experience: playerData.experience || null, // 9 (years)
          // We'll fetch detailed stats later when user views player profile
        },
      });

      console.log(`   ✅ Cached: ${playerData.name} (${playerData.position})`);
      return player;
    } catch (error) {
      console.error(
        `   ❌ Error caching player ${playerData.name}:`,
        error.message
      );
      // Don't throw - continue with other players
    }
  },

  // Search players by name in our cached database
  async searchCachedPlayers(name) {
    try {
      const players = await prisma.player.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
        include: {
          stats: {
            orderBy: { season: "desc" },
            take: 1, // Get most recent season stats
          },
        },
      });

      console.log(
        `🔍 Search for "${name}" found ${players.length} cached players`
      );
      return players;
    } catch (error) {
      console.error("Error searching cached players:", error);
      throw error;
    }
  },
};

module.exports = PlayerCacheService;
