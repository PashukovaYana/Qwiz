// API-маршрут входа: POST /api/auth/login
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail, verifyPassword, createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Введите почту и пароль" },
      { status: 400 }
    );
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json(
      { error: "Неверная почта или пароль" },
      { status: 401 }
    );
  }

  const token = createSession(user.id);
  cookies().set("session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, role: user.role },
  });
}
