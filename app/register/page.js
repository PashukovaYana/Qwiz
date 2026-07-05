"use client"; // страница с формой — работает в браузере

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, Loader, Users, Mic } from "@/components/Icons";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("participant"); // по умолчанию — участник
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        return;
      }
      router.push("/dashboard"); // успех — в личный кабинет
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

        <h1 className="text-2xl font-black text-white">Регистрация</h1>
        <p className="mt-1 text-sm text-slate-400">Создайте аккаунт участника или организатора</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Выбор роли */}
          <div className="grid grid-cols-2 gap-3">
            <RoleButton
              active={role === "participant"}
              onClick={() => setRole("participant")}
              icon={<Users className="h-5 w-5" />}
              label="Участник"
            />
            <RoleButton
              active={role === "organizer"}
              onClick={() => setRole("organizer")}
              icon={<Mic className="h-5 w-5" />}
              label="Организатор"
            />
          </div>

          <Field label="Имя" value={name} onChange={setName} placeholder="Как вас зовут" />
          <Field label="Почта" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
          <Field label="Пароль" value={password} onChange={setPassword} type="password" placeholder="Минимум 4 символа" />

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <Loader className="h-5 w-5" /> Создаём…
              </>
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-brand-light hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
}

// Кнопка выбора роли
function RoleButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 text-sm font-semibold transition ${
        active
          ? "border-brand bg-brand/15 text-brand-light shadow-glow"
          : "border-slate-700 text-slate-400 hover:bg-slate-800/60"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Небольшой переиспользуемый компонент поля ввода
function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </label>
  );
}
