// Страница с полными результатами одной проведённой игры.
// Открывать может только организатор, которому принадлежит квиз.
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { getGameDetails } from "@/lib/history";
import { ArrowLeft, Trophy } from "@/components/Icons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Дату из базы (UTC) показываем в удобном виде
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T") + "Z");
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GameResultsPage({ params }) {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  const game = getGameDetails(Number(params.id));
  if (!game) notFound();

  // Доступ только у организатора этой игры (чужие результаты смотреть нельзя)
  if (game.organizerId !== user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-surface-deep/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> В личный кабинет
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-black text-white">{game.title}</h1>
        <p className="mt-1 text-slate-400">
          Игра завершена {formatDate(game.finishedAt)} · {game.results.length} игрок(ов)
        </p>

        <div className="mt-6 panel p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Trophy className="h-5 w-5 text-accent" /> Итоговый лидерборд
          </h2>

          {game.results.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">В этой игре никто не сыграл.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {game.results.map((r) => (
                <li
                  key={r.place}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    r.place === 1
                      ? "border border-accent/40 bg-accent/10 shadow-glow"
                      : "border border-slate-800 bg-slate-950/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black ${
                        r.place === 1
                          ? "bg-gradient-to-br from-brand to-accent text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {r.place}
                    </span>
                    <span className="font-semibold text-white">{r.nickname}</span>
                  </span>
                  <span className="font-bold text-slate-200">{r.score} очков</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
