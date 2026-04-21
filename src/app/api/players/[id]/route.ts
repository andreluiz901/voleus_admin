import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { type Gender, isGender } from "@/lib/gender";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, skillLevel, gender } = body;

    // Verificar se jogador existe
    const player = await prisma.player.findUnique({
      where: { id },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Preparar dados para atualização
    const updateData: { name?: string; skillLevel?: number; gender?: Gender } =
      {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Player name must be a non-empty string" },
          { status: 400 },
        );
      }
      updateData.name = name.trim();
    }

    if (skillLevel !== undefined) {
      if (skillLevel < 1 || skillLevel > 5) {
        return NextResponse.json(
          { error: "Skill level must be between 1 and 5" },
          { status: 400 },
        );
      }
      updateData.skillLevel = Number(skillLevel);
    }

    if (gender !== undefined) {
      if (!isGender(gender)) {
        return NextResponse.json(
          { error: "Gender must be one of: MALE, FEMALE, OTHER" },
          { status: 400 },
        );
      }
      updateData.gender = gender;
    }

    // Se não há nada para atualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(player, { status: 200 });
    }

    // Atualizar jogador
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPlayer, { status: 200 });
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const player = await prisma.player.findUnique({
      where: { id },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player, { status: 200 });
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const player = await prisma.player.findUnique({
      where: { id },
      include: { attendances: true, teamPlayers: true },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (player.attendances.length > 0 || player.teamPlayers.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete player with game history" },
        { status: 400 },
      );
    }

    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 },
    );
  }
}
