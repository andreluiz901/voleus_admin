import { prisma } from "@/lib/prisma";

type GenPlayer = {
  id: string;
  name: string;
  skillLevel: number;
};

type Restriction = {
  playerAId: string;
  playerBId: string;
  type: "TOGETHER" | "NOT_TOGETHER";
};

type TeamLock = {
  playerId: string;
  targetTeamNumber: number;
};

type GenerationResult = {
  teams: GenPlayer[][];
  benchPlayers: GenPlayer[];
  score: number;
};

function isPair(a: string, b: string, x: string, y: string) {
  return (a === x && b === y) || (a === y && b === x);
}

function hasForbiddenPair(team: GenPlayer[], restrictions: Restriction[]) {
  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      if (
        restrictions.some(
          (r) =>
            r.type === "NOT_TOGETHER" &&
            isPair(team[i].id, team[j].id, r.playerAId, r.playerBId),
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function togetherPenalty(teams: GenPlayer[][], restrictions: Restriction[]) {
  let penalty = 0;
  for (const restriction of restrictions) {
    if (restriction.type !== "TOGETHER") continue;
    const teamA = teams.find((team) =>
      team.some((player) => player.id === restriction.playerAId),
    );
    const teamB = teams.find((team) =>
      team.some((player) => player.id === restriction.playerBId),
    );
    if (!teamA || !teamB || teamA !== teamB) {
      penalty += 1000;
    }
  }
  return penalty;
}

function getSkillBalanceScore(teams: GenPlayer[][]) {
  const totals = teams.map((team) =>
    team.reduce((sum, player) => sum + player.skillLevel, 0),
  );
  const max = Math.max(...totals);
  const min = Math.min(...totals);
  return max - min;
}

function randomShuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function tryGenerate(
  regularPlayers: GenPlayer[],
  teamSize: number,
  totalTeams: number,
  restrictions: Restriction[],
  locks: TeamLock[],
): GenerationResult | null {
  const teams: GenPlayer[][] = Array.from({ length: totalTeams }, () => []);
  const lockMap = new Map<string, number>();

  for (const lock of locks) {
    const targetIndex = lock.targetTeamNumber - 1;
    if (targetIndex < 0 || targetIndex >= totalTeams) return null;
    lockMap.set(lock.playerId, targetIndex);
  }

  const lockedIds = new Set(locks.map((lock) => lock.playerId));
  const playersById = new Map(
    regularPlayers.map((player) => [player.id, player]),
  );

  for (const lock of locks) {
    const player = playersById.get(lock.playerId);
    if (!player) return null;
    const targetIndex = lock.targetTeamNumber - 1;
    teams[targetIndex].push(player);
    if (teams[targetIndex].length > teamSize) return null;
  }

  const unlockedPlayers = randomShuffle(
    regularPlayers.filter((player) => !lockedIds.has(player.id)),
  );

  unlockedPlayers.sort((a, b) => b.skillLevel - a.skillLevel);

  for (const player of unlockedPlayers) {
    const preferredOrder = [...teams.keys()].sort(
      (a, b) =>
        teams[a].reduce((sum, p) => sum + p.skillLevel, 0) -
        teams[b].reduce((sum, p) => sum + p.skillLevel, 0),
    );

    let placed = false;
    for (const index of preferredOrder) {
      if (teams[index].length >= teamSize) continue;
      const candidate = [...teams[index], player];
      if (hasForbiddenPair(candidate, restrictions)) continue;
      teams[index].push(player);
      placed = true;
      break;
    }

    if (!placed) {
      return null;
    }
  }

  for (const team of teams) {
    if (team.length !== teamSize) return null;
  }

  const score =
    getSkillBalanceScore(teams) + togetherPenalty(teams, restrictions);
  return { teams, benchPlayers: [], score };
}

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
      `Jogadores insuficientes. Mínimo necessário: ${minPlayerCount}, Confirmados: ${players.length}`,
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

  const teamAssignmentLockDelegate = (
    prisma as unknown as {
      teamAssignmentLock?: {
        findMany: (args: {
          where: { gameId: string };
          select: { playerId: true; targetTeamNumber: true };
        }) => Promise<TeamLock[]>;
      };
    }
  ).teamAssignmentLock;

  const restrictionsPromise = prisma.restriction
    .findMany({
      where: { gameId },
      select: { playerAId: true, playerBId: true, type: true },
    })
    .catch(async () =>
      prisma.restriction.findMany({
        // Fallback for environments where Restriction is not game-scoped yet.
        select: { playerAId: true, playerBId: true, type: true },
      }),
    );

  const [restrictions, locks] = await Promise.all([
    restrictionsPromise,
    teamAssignmentLockDelegate?.findMany({
      where: { gameId },
      select: { playerId: true, targetTeamNumber: true },
    }) ?? Promise.resolve([]),
  ]);

  const confirmedIds = new Set(players.map((player) => player.id));
  const invalidLock = locks.find((lock) => !confirmedIds.has(lock.playerId));
  if (invalidLock) {
    throw new Error("Existe fixacao com jogador nao confirmado neste jogo");
  }

  let bestResult: GenerationResult | null = null;
  const attempts = 120;
  for (let i = 0; i < attempts; i++) {
    const result = tryGenerate(
      regularPlayers,
      teamSize,
      totalTeams,
      restrictions,
      locks,
    );
    if (!result) continue;
    if (!bestResult || result.score < bestResult.score) {
      bestResult = result;
    }
    if (bestResult.score === 0) break;
  }

  if (!bestResult) {
    throw new Error(
      "Nao foi possivel gerar times respeitando as regras configuradas para este jogo",
    );
  }

  const teams = bestResult.teams;

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
