import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_VALUE,
  ADMIN_TOKEN_COOKIE_NAME,
} from "@/lib/admin-cookie";

const ADMIN_LOGIN_PATH = "/admin/login";

function safeInternalPath(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  const isAuthed = token === ADMIN_SESSION_VALUE;

  if (pathname === ADMIN_LOGIN_PATH) {
    if (isAuthed) {
      const redirectTarget = safeInternalPath(
        request.nextUrl.searchParams.get("redirect"),
        "/admin",
      );
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthed) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
