import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const isAuth = await isAdminAuthenticated();

  if (!isAuth) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({ authenticated: true });
}
