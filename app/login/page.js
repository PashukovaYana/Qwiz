"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, Loader } from "@/components/Icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="panel w-full max-w-md p-8 shadow-glow">
        <Link href="/" className="mb-6 flex items-center gap-2 text-slate-300 transition hover:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-accent text-white">
            <Logo className="h-5 w-5" />
          </span>
          <span className="font-bold">Quiz Arena</span>
        </Link>

        <h1 className="text-2xl font-black text-white">Вход</h1>
        <p className="mt-1 text-sm text-slate-400">Рады видеть снова</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="label">Почта</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </label>
          <label className="block">
            <span className="label">Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              className="input"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <Loader className="h-5 w-5" /> Входим…
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-semibold text-brand-light hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}
