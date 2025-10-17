// services/playerService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PlayerService = {
  async findPlayersByName(name) {
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
            orderBy: {
              season: 'desc'
            },
            take: 1
          }
        }
      });
      
      return players;
    } catch (error) {
      console.error('Error searching players:', error);
      throw new Error('Database search failed');
    }
  },

  async getPlayerById(id) {
    return await prisma.player.findUnique({
      where: { id },
      include: { stats: true }
    });
  },

  async getPlayerByExternalId(externalId) {
    return await prisma.player.findUnique({
      where: { externalId },
      include: { stats: true }
    });
  }
};

module.exports = PlayerService;