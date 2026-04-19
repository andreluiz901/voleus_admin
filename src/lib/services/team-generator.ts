import { prisma } from "@/lib/prisma";

export async function generateTeams(gameId: string) {
  // 0 — Limpar times antigos
  await prisma.teamPlayer.deleteMany({
    where: {
      team: {
        gameId,
      },
    },
  });

  await prisma.team.deleteMany({
    where: {
      gameId,
    },
  });

  // 1 — Buscar jogo
  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error("Jogo não encontrado");
  }

  // 2 — Buscar jogadores confirmados
  const attendances = await prisma.attendance.findMany({
    where: {
      gameId,
      confirmed: true,
    },
    include: {
      player: true,
    },
  });

  const players = attendances.map((a) => a.player);

  if (players.length === 0) {
    throw new Error("Nenhum jogador confirmado para este jogo");
  }

  const teamSize = game.teamSize;
  const minPlayerCount = 2 * teamSize;

  // 3 — Validar mínimo de jogadores (precisa de ao menos 2 times completos)
  if (players.length < minPlayerCount) {
    throw new Error(
      `Jogadores insuficientes. Mínimo necessário: ${minPlayerCount}, Confirmados: ${players.length}`
    );
  }

  // 4 — Ordenar por skill (maior → menor)
  players.sort((a, b) => b.skillLevel - a.skillLevel);

  // 5 — Calcular times regulares e suplentes
  const totalTeams = Math.floor(players.length / teamSize);
  const playersInRegularTeams = totalTeams * teamSize;
  const benchPlayersCount = players.length - playersInRegularTeams;

  // 6 — Separar jogadores regulares vs suplentes
  const regularPlayers = players.slice(0, playersInRegularTeams);
  const benchPlayers = players.slice(playersInRegularTeams);

  // 7 — Criar estrutura de times regulares
  type PlayerType = typeof players[number];

  const teams: PlayerType[][] = [];

  for (let i = 0; i < totalTeams; i++) {
    teams.push([]);
  }

  // 8 — Distribuição em snake (apenas times regulares)
  let direction = 1;
  let teamIndex = 0;

  for (const player of regularPlayers) {
    teams[teamIndex].push(player);

    teamIndex += direction;

    if (teamIndex === totalTeams) {
      direction = -1;
      teamIndex = totalTeams - 1;
    }

    if (teamIndex < 0) {
      direction = 1;
      teamIndex = 0;
    }
  }

  // 9 — Salvar times regulares no banco
  for (let i = 0; i < teams.length; i++) {
    const team = await prisma.team.create({
      data: {
        name: `Time ${i + 1}`,
        gameId: game.id,
      },
    });

    for (const player of teams[i]) {
      await prisma.teamPlayer.create({
        data: {
          teamId: team.id,
          playerId: player.id,
        },
      });
    }
  }

  // 10 — Criar time de suplentes se houver excedente
  if (benchPlayersCount > 0) {
    const benchTeam = await prisma.team.create({
      data: {
        name: "Suplentes",
        gameId: game.id,
      },
    });

    for (const player of benchPlayers) {
      await prisma.teamPlayer.create({
        data: {
          teamId: benchTeam.id,
          playerId: player.id,
        },
      });
    }
  }

  return teams;
}
