import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  const players = [
    { name: "André", skillLevel: 4, gender: "MALE" as const, isAdmin: true },
    { name: "João", skillLevel: 3, gender: "MALE" as const },
    { name: "Pedro", skillLevel: 2, gender: "MALE" as const },
    { name: "Lucas", skillLevel: 5, gender: "MALE" as const },
    { name: "Carlos", skillLevel: 3, gender: "MALE" as const },
    { name: "Rafael", skillLevel: 4, gender: "MALE" as const },
    { name: "Bruno", skillLevel: 2, gender: "MALE" as const },
    { name: "Marcos", skillLevel: 3, gender: "MALE" as const },
    { name: "Thiago", skillLevel: 4, gender: "MALE" as const },
    { name: "Felipe", skillLevel: 3, gender: "MALE" as const },
    { name: "Diego", skillLevel: 2, gender: "MALE" as const },
    { name: "Henrique", skillLevel: 5, gender: "MALE" as const },
  ];

  for (const player of players) {
    await prisma.player.create({
      data: player,
    });
  }

  console.log("✅ Seed finished.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
