import { prisma } from "@/lib/prisma";

async function main() {
  const game = await prisma.game.findFirst();

  if (!game) {
    throw new Error("Game not found");
  }

  const players = await prisma.player.findMany({
    take: 12
  });

  for (const player of players) {
    await prisma.attendance.create({
      data: {
        playerId: player.id,
        gameId: game.id,
        confirmed: true
      }
    });
  }

  console.log("✅ Attendance created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());