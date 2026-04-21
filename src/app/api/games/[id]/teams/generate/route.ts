import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTeams } from "@/lib/services/team-generator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: gameId } = await params;
    const body = await request.json().catch(() => ({}));
    const forceRegenerate = body?.forceRegenerate ?? true;

    // Verificar se jogo existe
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Jogo não encontrado" },
        { status: 404 },
      );
    }

    if (!forceRegenerate) {
      return NextResponse.json(
        { error: "forceRegenerate must be true for this endpoint" },
        { status: 400 },
      );
    }

    // Gerar times
    await generateTeams(gameId);

    // Retornar jogo atualizado com times
    const updatedGame = await prisma.game.findUnique({
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

    return NextResponse.json(updatedGame, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao gerar times";
    console.error("Error generating teams:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
