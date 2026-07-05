// API-маршрут выхода: POST /api/auth/logout
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const token = cookies().get("session")?.value;
  deleteSession(token);
  cookies().delete("session");
  return NextResponse.json({ ok: true });
}
