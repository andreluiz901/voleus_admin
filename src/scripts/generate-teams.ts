import { generateTeams } from "@/lib/services/team-generator";
import { prisma } from "@/lib/prisma";
import { presentTeams } from "@/lib/team-presenter";

async function main() {

  const game = await prisma.game.findFirst();

  if (!game) {
    throw new Error("Game not found");
  }

  const teams = await generateTeams(game.id);

  presentTeams(teams, game.hourPrice, game.hours);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());