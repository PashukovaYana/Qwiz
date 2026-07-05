// API-маршрут регистрации: POST /api/auth/register
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, findUserByEmail, createSession } from "@/lib/auth";

export const runtime = "nodejs"; // нужен доступ к базе (Node, не Edge)

export async function POST(request) {
  const { email, password, name, role } = await request.json();

  // Простая проверка полей
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json(
      { error: "Пароль должен быть не короче 4 символов" },
      { status: 400 }
    );
  }
  if (role !== "organizer" && role !== "participant") {
    return NextResponse.json({ error: "Неверная роль" }, { status: 400 });
  }
  if (findUserByEmail(email)) {
    return NextResponse.json(
      { error: "Пользователь с такой почтой уже есть" },
      { status: 400 }
    );
  }

  // Создаём пользователя и сразу входим (создаём сессию)
  const user = createUser({ email, password, name, role });
  const token = createSession(user.id);

  cookies().set("session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // неделя
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, role: user.role },
  });
}
