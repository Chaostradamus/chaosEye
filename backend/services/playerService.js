// services/playerService.js
const { PrismaClient } = require("@prisma/client");
const sportsRadarAPI = require("./apiService");
const playerCacheService = require("./playerCacheService");
const prisma = new PrismaClient();

const PlayerService = {
  async searchPlayers(name) {
    try {
      const cachedPlayers = await playerCacheService.searchCachedPlayers(name);

      if (cachedPlayers.length > 0) {
        console.log(`🎯 Found ${cachedPlayers.length} players for "${name}"`);

        const enhancedPlayers = await Promise.all(
          cachedPlayers.map(async (player) => {
            if (
              (!player.stats || player.stats.length === 0) &&
              player.externalId
            ) {
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
      console.error("Error searching players:", error);
      throw new Error("Search failed");
    }
  },
  async debugPlayerStats(playerExternalId) {
    try {
      console.log("🔍 DEBUG: Fetching raw SportsRadar data...");
      const playerData = await sportsRadarAPI.getPlayerById(playerExternalId);

      console.log("📊 DEBUG: Player seasons:", playerData.seasons?.length);

      if (playerData.seasons && playerData.seasons.length > 0) {
        const latestSeason =
          playerData.seasons.find((s) => s.type === "REG") ||
          playerData.seasons[0];
        console.log(
          "🔍 DEBUG: Latest season structure:",
          JSON.stringify(latestSeason, null, 2).substring(0, 1000)
        );

        if (latestSeason.teams && latestSeason.teams.length > 0) {
          const teamStats = latestSeason.teams[0].statistics;
          console.log(
            "📊 DEBUG: Available statistics fields:",
            Object.keys(teamStats || {})
          );

          if (teamStats) {
            console.log("🎯 DEBUG: Receiving stats:", teamStats.receiving);
            console.log("🎯 DEBUG: Rushing stats:", teamStats.rushing);
            console.log("🎯 DEBUG: Passing stats:", teamStats.passing);
          }
        }
      }

      return playerData;
    } catch (error) {
      console.error("Debug error:", error);
    }
  },

  async cacheAllPlayers() {
    const result = await playerCacheService.cacheAllPlayers();
    return result;
  },

  async getPlayerById(id) {
    return await prisma.player.findUnique({
      where: { id },
      include: { stats: true },
    });
  },

  async fetchAndCachePlayer(playerId) {
    try {
      const existingPlayer = await prisma.player.findUnique({
        where: { externalId: playerId },
        include: { stats: true },
      });

      if (existingPlayer) {
        return existingPlayer;
      }

      const playerData = await sportsRadarAPI.getPlayerById(playerId);
      const cachedPlayer = await this.transformAndCachePlayer(playerData);

      return cachedPlayer;
    } catch (error) {
      console.error("Error fetching from SportsRadar:", error);
      throw error;
    }
  },

  async transformAndCachePlayer(apiData) {
    const player = await prisma.player.create({
      data: {
        externalId: apiData.id,
        name: apiData.name,
        position: apiData.position,
        team: apiData.team?.name || "Unknown",
        jerseyNumber: parseInt(apiData.jersey) || null,
        height: apiData.height ? `${apiData.height}` : null,
        weight: apiData.weight || null,
        college: apiData.college || null,
        experience: apiData.experience || null,
      },
      include: {
        stats: true,
      },
    });

    return player;
  },

  async fetchAndCachePlayerStats(playerExternalId) {
    try {
      console.log(`📊 Fetching stats for player ${playerExternalId}...`);

      const playerData = await sportsRadarAPI.getPlayerById(playerExternalId);

      const existingPlayer = await prisma.player.findUnique({
        where: { externalId: playerExternalId },
        include: { stats: true },
      });

      if (!existingPlayer) {
        throw new Error("Player not found in database");
      }

      if (playerData.seasons && playerData.seasons.length > 0) {
        await this.cachePlayerStats(existingPlayer.id, playerData.seasons);
        console.log(`✅ Cached stats for ${existingPlayer.name}`);
      } else {
        console.log(`ℹ️  No season stats available for ${existingPlayer.name}`);
      }

      return await prisma.player.findUnique({
        where: { id: existingPlayer.id },
        include: { stats: { orderBy: { season: "desc" } } },
      });
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  },

  // services/playerService.js - REPLACE the cachePlayerStats function
  async cachePlayerStats(playerId, seasons) {
    try {
      const regularSeasons = seasons.filter((season) => season.type === "REG");

      for (const season of regularSeasons) {
        const teamStats = season.teams[0]?.statistics;
        if (!teamStats) continue;

        const passing = teamStats.passing;
        const rushing = teamStats.rushing;
        const receiving = teamStats.receiving;
        const defense = teamStats.defense;
        const fumbles = teamStats.fumbles;
        const returns = teamStats.returns;
        const kicking = teamStats.kicking;

        const existingStats = await prisma.playerStat.findFirst({
          where: {
            playerId: playerId,
            season: season.year,
          },
        });

        if (!existingStats) {
          await prisma.playerStat.create({
            data: {
              playerId: playerId,
              season: season.year,
              gamesPlayed: teamStats.games_played || null,
              gamesStarted: teamStats.games_started || null,

              // 👇 PASSING STATS
              passingAttempts: passing?.attempts || null,
              passingCompletions: passing?.completions || null,
              completionPercentage: passing?.cmp_pct || null,
              passingYards: passing?.yards || null,
              passingTouchdowns: passing?.touchdowns || null,
              interceptions: passing?.interceptions || null,
              passerRating: passing?.rating || null,
              sacks: passing?.sacks || null,
              sackYards: passing?.sack_yards || null,
              longestPass: passing?.longest || null,
              airYards: passing?.air_yards || null,
              netPassingYards: passing?.net_yards || null,

              // 👇 RUSHING STATS
              rushingAttempts: rushing?.attempts || null,
              rushingYards: rushing?.yards || null,
              rushingTouchdowns: rushing?.touchdowns || null,
              yardsPerCarry: rushing?.avg_yards || null,
              longestRush: rushing?.longest || null,
              rushingFirstDowns: rushing?.first_downs || null,
              fumbles: fumbles?.fumbles || null,
              fumblesLost: fumbles?.lost_fumbles || null,

              // 👇 RECEIVING STATS
              targets: receiving?.targets || null,
              receptions: receiving?.receptions || null,
              receivingYards: receiving?.yards || null,
              receivingTouchdowns: receiving?.touchdowns || null,
              yardsPerReception: receiving?.avg_yards || null,
              longestReception: receiving?.longest || null,
              receivingFirstDowns: receiving?.first_downs || null,
              drops: receiving?.dropped_passes || null,

              // 👇 DEFENSIVE STATS
              tackles: defense?.tackles || null,
              soloTackles: defense?.solo_tackles || null,
              assists: defense?.assists || null,
              sacksMade: defense?.sacks || null,
              sackYardsMade: defense?.sack_yards || null,
              interceptionsMade: defense?.interceptions || null,
              passesDefended: defense?.passes_defended || null,
              forcedFumbles: defense?.forced_fumbles || null,
              fumbleRecoveries: defense?.fumble_recoveries || null,
              defensiveTouchdowns: defense?.defensive_touchdowns || null,
              quarterbackHits: defense?.qb_hits || null,
              tacklesForLoss: defense?.tloss || null,

              // 👇 SPECIAL TEAMS
              puntReturns: returns?.punt_returns || null,
              puntReturnYards: returns?.punt_return_yards || null,
              puntReturnTouchdowns: returns?.punt_return_touchdowns || null,
              kickReturns: returns?.kick_returns || null,
              kickReturnYards: returns?.kick_return_yards || null,
              kickReturnTouchdowns: returns?.kick_return_touchdowns || null,
              punts: kicking?.punts || null,
              puntYards: kicking?.punt_yards || null,
              fieldGoalsMade: kicking?.field_goals_made || null,
              fieldGoalsAttempted: kicking?.field_goals_attempted || null,
              fieldGoalPercentage: kicking?.field_goal_percentage || null,
              extraPointsMade: kicking?.extra_points_made || null,
              extraPointsAttempted: kicking?.extra_points_attempted || null,
            },
          });
          console.log(
            `      📊 Cached comprehensive stats for season ${season.year}`
          );
        }
      }
    } catch (error) {
      console.error("Error caching player stats:", error);
    }
  },
};

module.exports = PlayerService;
