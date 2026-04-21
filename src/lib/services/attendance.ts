import { type Gender, isGender } from "@/lib/gender";
import { prisma } from "@/lib/prisma";

/**
 * Adiciona um jogador a um jogo como presença confirmada
 *
 * @param gameId - ID do jogo
 * @param playerId - ID do jogador existente
 * @returns Jogo atualizado com attendances
 */
export async function addPlayerToGame(gameId: string, playerId: string) {
  // Verificar se jogo existe
  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  // Verificar se jogador existe
  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new Error("Player not found");
  }

  // Verificar se já não está adicionado
  const existing = await prisma.attendance.findUnique({
    where: {
      playerId_gameId: {
        playerId,
        gameId,
      },
    },
  });

  if (existing) {
    throw new Error("Player already added to this game");
  }

  // Criar attendance confirmado
  await prisma.attendance.create({
    data: {
      gameId,
      playerId,
      confirmed: true,
      paid: false,
    },
  });

  // Retornar jogo atualizado
  return await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      attendances: {
        include: {
          player: true,
        },
      },
      teams: {
        include: {
          players: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Adiciona varios jogadores existentes a um jogo em lote
 *
 * @param gameId - ID do jogo
 * @param playerIds - IDs dos jogadores existentes
 * @returns Jogo atualizado com attendances
 */
export async function addPlayersToGame(
  gameId: string,
  playerIds: string[],
) {
  if (playerIds.length === 0) {
    throw new Error("At least one playerId is required");
  }

  const uniquePlayerIds = [...new Set(playerIds)];

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const existingPlayers = await prisma.player.findMany({
    where: { id: { in: uniquePlayerIds } },
    select: { id: true },
  });

  if (existingPlayers.length !== uniquePlayerIds.length) {
    throw new Error("One or more players were not found");
  }

  await prisma.attendance.createMany({
    data: uniquePlayerIds.map((playerId) => ({
      gameId,
      playerId,
      confirmed: true,
      paid: false,
    })),
    skipDuplicates: true,
  });

  return await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      attendances: {
        include: {
          player: true,
        },
      },
      teams: {
        include: {
          players: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Remove um jogador de um jogo
 *
 * @param gameId - ID do jogo
 * @param playerId - ID do jogador
 * @returns Jogo atualizado
 */
export async function removePlayerFromGame(gameId: string, playerId: string) {
  // Verificar se attendance existe
  const attendance = await prisma.attendance.findUnique({
    where: {
      playerId_gameId: {
        playerId,
        gameId,
      },
    },
  });

  if (!attendance) {
    throw new Error("Player not found in this game");
  }

  // Deletar attendance
  await prisma.attendance.delete({
    where: {
      id: attendance.id,
    },
  });

  // Retornar jogo atualizado
  return await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      attendances: {
        include: {
          player: true,
        },
      },
      teams: {
        include: {
          players: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Cria um novo jogador e adiciona a um jogo
 *
 * @param gameId - ID do jogo
 * @param name - Nome do jogador
 * @param skillLevel - Nível de skill (1-5)
 * @returns Jogo atualizado
 */
export async function createAndAddPlayerToGame(
  gameId: string,
  name: string,
  skillLevel: number,
  gender: Gender,
) {
  // Validar skillLevel
  if (skillLevel < 1 || skillLevel > 5) {
    throw new Error("Skill level must be between 1 and 5");
  }

  // Validar nome
  if (!name || name.trim().length === 0) {
    throw new Error("Player name cannot be empty");
  }

  if (!isGender(gender)) {
    throw new Error("Gender must be one of: MALE, FEMALE, OTHER");
  }

  // Verificar se jogo existe
  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  // Criar novo jogador
  const player = await prisma.player.create({
    data: {
      name: name.trim(),
      skillLevel,
      gender,
    },
  });

  // Adicionar ao jogo
  return await addPlayerToGame(gameId, player.id);
}
