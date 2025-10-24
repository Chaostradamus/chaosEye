// services/playerService.js
const { PrismaClient } = require("@prisma/client");
const sportsRadarAPI = require("./apiService");
const playerCacheService = require("./playerCacheService"); // 👈 Import cache service
const prisma = new PrismaClient();

const PlayerService = {
  // 👇 UPDATED: Now searches our cached player database first
  async searchPlayers(name) {
    try {
      // 1. Search our cached players database
      const cachedPlayers = await playerCacheService.searchCachedPlayers(name);

      if (cachedPlayers.length > 0) {
        console.log(
          `🎯 Returning ${cachedPlayers.length} cached players for "${name}"`
        );
        return cachedPlayers;
      }

      // 2. If no cached results found
      console.log(
        `❌ No cached players found for "${name}" - consider rebuilding cache`
      );
      return [];
    } catch (error) {
      console.error("Error searching players:", error);
      throw new Error("Search failed");
    }
  },

  // 👇 NEW: Function to trigger cache rebuild
  async cacheAllPlayers() {
    return await playerCacheService.cacheAllPlayers();
  },

  // 👇 EXISTING: Get player by ID
  async getPlayerById(id) {
    return await prisma.player.findUnique({
      where: { id },
      include: { stats: true },
    });
  },

  // 👇 EXISTING: Fetch and cache individual player from SportsRadar
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

  // 👇 EXISTING: Transform and cache player data
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
};

module.exports = PlayerService;
