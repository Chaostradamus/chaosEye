// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample players...');

  // Create sample players
  const players = await prisma.player.createMany({
    data: [
      {
        externalId: 'mahomes-15',
        name: 'Patrick Mahomes',
        position: 'QB',
        team: 'KC',
        jerseyNumber: 15
      },
      {
        externalId: 'mccaffrey-23',
        name: 'Christian McCaffrey',
        position: 'RB',
        team: 'SF',
        jerseyNumber: 23
      },
      {
        externalId: 'jefferson-18',
        name: 'Justin Jefferson',
        position: 'WR',
        team: 'MIN',
        jerseyNumber: 18
      },
      {
        externalId: 'allen-17',
        name: 'Josh Allen',
        position: 'QB',
        team: 'BUF',
        jerseyNumber: 17
      },
      {
        externalId: 'hill-10',
        name: 'Tyreek Hill',
        position: 'WR',
        team: 'MIA',
        jerseyNumber: 10
      }
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${players.count} players`);

  // Add some sample stats for Mahomes
  const mahomes = await prisma.player.findFirst({
    where: { externalId: 'mahomes-15' }
  });

  if (mahomes) {
    await prisma.playerStat.create({
      data: {
        playerId: mahomes.id,
        season: 2024,
        passingYards: 4250,
        passingTouchdowns: 35,
        interceptions: 12,
        rushingYards: 280,
        rushingTouchdowns: 4
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });