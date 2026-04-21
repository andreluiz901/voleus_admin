import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const teamAssignmentLockDelegate = (
  prisma as unknown as {
    teamAssignmentLock?: {
      findMany: typeof prisma.team.findMany;
      upsert: (...args: unknown[]) => Promise<unknown>;
      findUnique: (...args: unknown[]) => Promise<{ gameId: string } | null>;
      delete: (...args: unknown[]) => Promise<unknown>;
    };
  }
).teamAssignmentLock;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: gameId } = await params;
    if (!teamAssignmentLockDelegate) return NextResponse.json([]);
    const locks = await teamAssignmentLockDelegate.findMany({
      where: { gameId },
      include: { player: true },
      orderBy: [{ targetTeamNumber: "asc" }, { id: "asc" }],
    } as never);
    return NextResponse.json(locks);
  } catch (error) {
    console.error("Error listing team locks:", error);
    return NextResponse.json(
      { error: "Falha ao listar fixacoes de time" },
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
    const { playerId, targetTeamNumber } = body;

    if (!playerId || !targetTeamNumber) {
      return NextResponse.json(
        { error: "Campos obrigatorios: playerId e targetTeamNumber" },
        { status: 400 },
      );
    }

    if (!teamAssignmentLockDelegate) {
      return NextResponse.json(
        {
          error:
            "Fixacao por time indisponivel neste ambiente. Rode migrate e generate.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(Number(targetTeamNumber)) ||
      Number(targetTeamNumber) < 1
    ) {
      return NextResponse.json(
        { error: "targetTeamNumber deve ser inteiro maior que 0" },
        { status: 400 },
      );
    }

    const lock = await teamAssignmentLockDelegate.upsert({
      where: {
        gameId_playerId: {
          gameId,
          playerId,
        },
      },
      update: { targetTeamNumber: Number(targetTeamNumber) },
      create: {
        gameId,
        playerId,
        targetTeamNumber: Number(targetTeamNumber),
      },
      include: { player: true },
    } as never);

    return NextResponse.json(lock, { status: 201 });
  } catch (error) {
    console.error("Error creating team lock:", error);
    return NextResponse.json(
      { error: "Falha ao criar fixacao de time" },
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
    const { lockId } = await request.json();

    if (!lockId) {
      return NextResponse.json({ error: "lockId obrigatorio" }, { status: 400 });
    }

    if (!teamAssignmentLockDelegate) {
      return NextResponse.json(
        {
          error:
            "Fixacao por time indisponivel neste ambiente. Rode migrate e generate.",
        },
        { status: 400 },
      );
    }

    const lock = await teamAssignmentLockDelegate.findUnique({
      where: { id: lockId },
      select: { gameId: true },
    } as never);
    if (!lock || lock.gameId !== gameId) {
      return NextResponse.json(
        { error: "Fixacao nao encontrada para este jogo" },
        { status: 404 },
      );
    }
    await teamAssignmentLockDelegate.delete({ where: { id: lockId } } as never);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team lock:", error);
    return NextResponse.json(
      { error: "Falha ao remover fixacao de time" },
      { status: 500 },
    );
  }
}
