import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { date: "desc" },
      include: {
        attendances: {
          include: {
            player: true,
          },
        },
        teams: {
          include: {
            players: true,
          },
        },
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { date, startTime, location, maxPlayers, teamSize, hourPrice, hours, notes } = body;

    // Validate
    if (!date || !location || !maxPlayers || !teamSize || hourPrice === undefined || !hours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse date
    const gameDate = new Date(date);

    const game = await prisma.game.create({
      data: {
        date: gameDate,
        startTime,
        location,
        maxPlayers: Number(maxPlayers),
        teamSize: Number(teamSize),
        hourPrice: Number(hourPrice),
        hours: Number(hours),
        notes: notes || null,
        status: "OPEN",
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
