import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function hasGameScopedRestriction() {
  try {
    const fields = (prisma as unknown as { _runtimeDataModel?: { models?: Record<string, { fields?: Array<{ name: string }> }> } })._runtimeDataModel?.models?.Restriction?.fields ?? [];
    return fields.some((field) => field.name === "gameId");
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: gameId } = await params;
    const restrictions = hasGameScopedRestriction()
      ? await prisma.restriction.findMany({
          where: { gameId },
          include: {
            playerA: true,
            playerB: true,
          },
          orderBy: { id: "desc" },
        })
      : [];
    return NextResponse.json(restrictions);
  } catch (error) {
    console.error("Error listing restrictions:", error);
    return NextResponse.json(
      { error: "Falha ao listar restricoes" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const { id: gameId } = await params;
    const body = await request.json();
    const { playerAId, playerBId, type } = body;

    if (!playerAId || !playerBId || !type) {
      return NextResponse.json(
        { error: "Campos obrigatorios: playerAId, playerBId e type" },
        { status: 400 },
      );
    }
    if (!["TOGETHER", "NOT_TOGETHER"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo invalido. Use TOGETHER ou NOT_TOGETHER" },
        { status: 400 },
      );
    }
    if (playerAId === playerBId) {
      return NextResponse.json(
        { error: "A restricao precisa de dois jogadores diferentes" },
        { status: 400 },
      );
    }

    if (!hasGameScopedRestriction()) {
      return NextResponse.json(
        {
          error:
            "Restricoes por jogo indisponiveis neste ambiente. Rode migrate e generate.",
        },
        { status: 400 },
      );
    }

    const [a, b] = [playerAId, playerBId].sort();
    const restriction = await prisma.restriction.create({
      data: {
        gameId,
        playerAId: a,
        playerBId: b,
        type,
      },
      include: {
        playerA: true,
        playerB: true,
      },
    });

    return NextResponse.json(restriction, { status: 201 });
  } catch (error) {
    console.error("Error creating restriction:", error);
    return NextResponse.json(
      { error: "Falha ao criar restricao" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }
    const { id: gameId } = await params;
    const { restrictionId } = await request.json();
    if (!restrictionId) {
      return NextResponse.json(
        { error: "restrictionId obrigatorio" },
        { status: 400 },
      );
    }

    if (!hasGameScopedRestriction()) {
      return NextResponse.json(
        {
          error:
            "Restricoes por jogo indisponiveis neste ambiente. Rode migrate e generate.",
        },
        { status: 400 },
      );
    }

    const restriction = await prisma.restriction.findUnique({
      where: { id: restrictionId },
      select: { gameId: true },
    });
    if (!restriction || restriction.gameId !== gameId) {
      return NextResponse.json(
        { error: "Restricao nao encontrada para este jogo" },
        { status: 404 },
      );
    }
    await prisma.restriction.delete({ where: { id: restrictionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting restriction:", error);
    return NextResponse.json(
      { error: "Falha ao remover restricao" },
      { status: 500 },
    );
  }
}
