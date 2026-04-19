import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: gameId, playerId } = await params;
    const body = await request.json();
    const { paid } = body;

    if (typeof paid !== "boolean") {
      return NextResponse.json(
        { error: "paid must be a boolean" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }

    // Atualizar status de pagamento
    await prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        paid,
      },
    });

    // Retornar jogo atualizado
    const game = await prisma.game.findUnique({
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

    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update payment status";
    console.error("Error updating payment status:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
