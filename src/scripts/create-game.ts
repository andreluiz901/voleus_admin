import { prisma } from "@/lib/prisma";

async function main() {
  const admin = await prisma.player.findFirst({
    where: { isAdmin: true }
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  const game = await prisma.game.create({
    data: {
      date: new Date(),
      startTime: "19:00",

      location: "Arena Society",
      maxPlayers: 12,
      teamSize: 4,

      hourPrice: 120,
      hours: 2,

      createdById: admin.id
    }
  });

  console.log("✅ Game created:", game.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());