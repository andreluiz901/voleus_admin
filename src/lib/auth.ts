import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_VALUE,
  ADMIN_TOKEN_COOKIE_NAME,
} from "@/lib/admin-cookie";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const TOKEN_SECRET = process.env.TOKEN_SECRET || "volta-ao-volei-secret";

export async function hashPassword(password: string): Promise<string> {
  return crypto
    .createHash("sha256")
    .update(password + TOKEN_SECRET)
    .digest("hex");
}

export async function validateAdminPassword(
  password: string,
): Promise<boolean> {
  const hash = await hashPassword(password);
  const expectedHash = await hashPassword(ADMIN_PASSWORD);
  return hash === expectedHash;
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN_COOKIE_NAME, ADMIN_SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminToken();
  return token === ADMIN_SESSION_VALUE;
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN_COOKIE_NAME);
}
