"use client"; // страница входа в игру по коду

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play, ArrowLeft } from "@/components/Icons";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    const n = name.trim();
    if (!c || !n) return;
    // Переходим на игровой экран, имя передаём в адресе
    router.push(`/play/${c}?name=${encodeURIComponent(n)}`);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />

      <div className="panel relative z-10 w-full max-w-sm p-8 text-center shadow-glow">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent text-white">
          <Play className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-white">Войти в игру</h1>
        <p className="mt-1 text-sm text-slate-400">Введите код комнаты от организатора</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="КОД"
            maxLength={6}
            className="input text-center font-mono text-2xl font-black tracking-[0.4em] placeholder:tracking-normal placeholder:font-sans"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            maxLength={20}
            className="input text-center"
          />
          <button type="submit" className="btn-primary w-full">
            Войти
          </button>
        </form>

        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>
      </div>
    </main>
  );
}
