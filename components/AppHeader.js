// Общая шапка приложения (логотип + имя пользователя + выход).
// Серверный компонент; кнопка выхода внутри — клиентская.
import Link from "next/link";
import { Logo } from "@/components/Icons";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader({ user, roleLabel }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-surface-deep/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-accent text-white">
            <Logo className="h-5 w-5" />
          </span>
          Quiz Arena
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-400 sm:inline">
              {user.name}
              {roleLabel ? <span className="text-slate-600"> · {roleLabel}</span> : null}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
