import { NextResponse } from "next/server";
import { CORRETOR_COOKIE } from "@/lib/auth/corretor";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CORRETOR_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
