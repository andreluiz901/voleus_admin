import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, skillLevel } = body;

    // Validar campos obrigatórios
    if (!name || skillLevel === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, skillLevel" },
        { status: 400 }
      );
    }

    // Validar skillLevel
    if (skillLevel < 1 || skillLevel > 5) {
      return NextResponse.json(
        { error: "Skill level must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validar nome
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Player name must be a non-empty string" },
        { status: 400 }
      );
    }

    // Criar jogador
    const player = await prisma.player.create({
      data: {
        name: name.trim(),
        skillLevel: Number(skillLevel),
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
