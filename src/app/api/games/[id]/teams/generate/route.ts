import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { generateTeams } from "@/lib/services/team-generator";
import { prisma } from "@/lib/prisma";


export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: gameId } = await params;

    // Verificar se jogo existe
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
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
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar times";
    console.error("Error generating teams:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
