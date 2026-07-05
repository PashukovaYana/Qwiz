// Помощник: определить, какой пользователь сейчас вошёл (читает cookie сессии).
// Используется на серверных страницах (например, в личном кабинете).

import { cookies } from "next/headers";
import { getUserByToken } from "@/lib/auth";

export function getCurrentUser() {
  const token = cookies().get("session")?.value;
  return getUserByToken(token);
}
