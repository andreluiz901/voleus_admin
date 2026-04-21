import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { parseDateOnlyAsUtcNoon } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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
    const { status } = body;

    if (!status || !["OPEN", "FINISHED", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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
      { status: 500 },
    );
  }
}

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

    const {
      date,
      startTime,
      location,
      maxPlayers,
      teamSize,
      hourPrice,
      hours,
      notes,
      status,
    } = body;

    if (
      !date ||
      !startTime ||
      !location ||
      !maxPlayers ||
      !teamSize ||
      hourPrice === undefined ||
      !hours
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const parsedDate = parseDateOnlyAsUtcNoon(date);
    if (!parsedDate) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 },
      );
    }

    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return NextResponse.json(
        { error: "Invalid time format. Expected HH:mm." },
        { status: 400 },
      );
    }

    const safeStatus =
      status && ["OPEN", "FINISHED", "CLOSED"].includes(status)
        ? status
        : undefined;

    const game = await prisma.game.update({
      where: { id },
      data: {
        date: parsedDate,
        startTime,
        location,
        maxPlayers: Number(maxPlayers),
        teamSize: Number(teamSize),
        hourPrice: Number(hourPrice),
        hours: Number(hours),
        notes: notes?.trim() ? notes.trim() : null,
        ...(safeStatus ? { status: safeStatus } : {}),
      },
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
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 },
    );
  }
}
