import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  addPlayerToGame,
  addPlayersToGame,
  createAndAddPlayerToGame,
  removePlayerFromGame,
} from "@/lib/services/attendance";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: gameId } = await params;
    const body = await request.json();

    // Verifica se é adicionar jogador existente ou criar novo
    if (Array.isArray(body.playerIds)) {
      const playerIds = body.playerIds.filter((id: unknown) => typeof id === "string");

      if (playerIds.length === 0) {
        return NextResponse.json(
          { error: "Missing playerIds" },
          { status: 400 },
        );
      }

      const game = await addPlayersToGame(gameId, playerIds);
      return NextResponse.json(game, { status: 200 });
    } else if (body.playerId) {
      // Adicionar jogador existente
      const { playerId } = body;

      if (!playerId) {
        return NextResponse.json(
          { error: "Missing playerId" },
          { status: 400 },
        );
      }

      const game = await addPlayerToGame(gameId, playerId);
      return NextResponse.json(game, { status: 200 });
    } else if (body.name && body.skillLevel !== undefined) {
      // Criar novo jogador e adicionar ao jogo
      const { name, skillLevel, gender } = body;

      if (!gender) {
        return NextResponse.json(
          { error: "Missing gender when creating a new player" },
          { status: 400 },
        );
      }

      const game = await createAndAddPlayerToGame(
        gameId,
        name,
        skillLevel,
        gender,
      );
      return NextResponse.json(game, { status: 201 });
    } else {
      return NextResponse.json(
        {
          error:
            "Must provide playerId, playerIds or (name, skillLevel and gender)",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add player to game";
    console.error("Error adding player to game:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: gameId } = await params;
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
    }

    const game = await removePlayerFromGame(gameId, playerId);
    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to remove player from game";
    console.error("Error removing player from game:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
