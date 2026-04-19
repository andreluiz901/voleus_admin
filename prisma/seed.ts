import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  const players = [
    { name: "André", skillLevel: 4, isAdmin: true },
    { name: "João", skillLevel: 3 },
    { name: "Pedro", skillLevel: 2 },
    { name: "Lucas", skillLevel: 5 },
    { name: "Carlos", skillLevel: 3 },
    { name: "Rafael", skillLevel: 4 },
    { name: "Bruno", skillLevel: 2 },
    { name: "Marcos", skillLevel: 3 },
    { name: "Thiago", skillLevel: 4 },
    { name: "Felipe", skillLevel: 3 },
    { name: "Diego", skillLevel: 2 },
    { name: "Henrique", skillLevel: 5 }
  ];

  for (const player of players) {
    await prisma.player.create({
      data: player
    });
  }

  console.log("✅ Seed finished.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());