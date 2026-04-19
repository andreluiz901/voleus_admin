import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  await clearAdminCookie();

  return response;
}
