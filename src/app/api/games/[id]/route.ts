import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const game = await prisma.game.findUnique({
      where: { id },
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

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["OPEN", "FINISHED", "CLOSED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const game = await prisma.game.update({
      where: { id },
      data: { status },
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

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error updating game status:", error);
    return NextResponse.json(
      { error: "Failed to update game status" },
      { status: 500 }
    );
  }
}
