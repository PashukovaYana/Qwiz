// Личный кабинет — серверная страница.
// Если пользователь не вошёл, отправляем на страницу входа.
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { getQuizzesByOrganizer } from "@/lib/quizzes";
import { getGamesByOrganizer, getGamesByParticipant } from "@/lib/history";
import AppHeader from "@/components/AppHeader";
import { Plus, Play, Trophy, Layers, Clock } from "@/components/Icons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // всегда читать свежие данные (cookie)

// Дату из базы ("2026-07-05 14:30:00", UTC) показываем в удобном виде
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T") + "Z");
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Подпись места («1-е место», «2-е место», …)
function placeLabel(place) {
  return `${place}-е место`;
}

export default function DashboardPage() {
  const user = getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const isOrganizer = user.role === "organizer";
  // Для организатора — его квизы и история проведённых игр.
  // Для участника — история его участия.
  const quizzes = isOrganizer ? getQuizzesByOrganizer(user.id) : [];
  const history = isOrganizer
    ? getGamesByOrganizer(user.id)
    : getGamesByParticipant(user.id);

  return (
    <div className="min-h-screen">
      <AppHeader user={user} roleLabel={isOrganizer ? "организатор" : "участник"} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-black text-white">Привет, {user.name}</h1>
        <p className="mt-1 text-slate-400">
          {isOrganizer
            ? "Создавайте квизы и проводите их в реальном времени."
            : "Подключайтесь к квизам по коду комнаты и соревнуйтесь."}
        </p>

        {/* Главное действие в зависимости от роли */}
        <div className="mt-6 panel p-6">
          {isOrganizer ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Layers className="h-5 w-5 text-brand-light" /> Мои квизы
                </h2>
                <Link href="/organizer/new" className="btn-primary py-2 text-sm">
                  <Plus className="h-4 w-4" /> Создать квиз
                </Link>
              </div>

              {quizzes.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Пока нет ни одного квиза. Создайте первый!
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {quizzes.map((quiz) => (
                    <li key={quiz.id}>
                      <Link
                        href={`/organizer/${quiz.id}`}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 transition hover:border-brand/50 hover:bg-slate-900"
                      >
                        <span className="font-semibold text-white">{quiz.title}</span>
                        <span className="text-sm text-slate-500">
                          {quiz.category || "—"} · {quiz.questionCount} вопрос(ов)
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Play className="h-5 w-5 text-brand-light" /> Присоединиться к игре
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Введите код комнаты, который дал организатор.
              </p>
              <Link href="/join" className="btn-primary mt-4">
                Ввести код комнаты
              </Link>
            </>
          )}
        </div>

        {/* История */}
        <div className="mt-6 panel p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock className="h-5 w-5 text-brand-light" />
            {isOrganizer ? "История проведённых квизов" : "История участия"}
          </h2>

          {history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Пока пусто — здесь появятся ваши игры.
            </p>
          ) : isOrganizer ? (
            // Организатор: список проведённых игр с победителем, ссылка на результаты
            <ul className="mt-4 space-y-2">
              {history.map((game) => (
                <li key={game.id}>
                  <Link
                    href={`/game/${game.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 transition hover:border-brand/50 hover:bg-slate-900"
                  >
                    <span>
                      <span className="font-semibold text-white">{game.title}</span>
                      <span className="ml-2 text-sm text-slate-500">
                        {formatDate(game.finishedAt)} · {game.players} игрок(ов)
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Trophy className="h-4 w-4 text-accent" />
                      Победитель: <b className="text-white">{game.winner || "—"}</b>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            // Участник: список игр, где он играл, с его местом и очками
            <ul className="mt-4 space-y-2">
              {history.map((game) => (
                <li
                  key={game.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3"
                >
                  <span>
                    <span className="font-semibold text-white">{game.title}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {formatDate(game.finishedAt)}
                    </span>
                  </span>
                  <span className="text-sm text-slate-300">
                    <span
                      className={`font-semibold ${
                        game.place === 1 ? "text-accent" : "text-slate-200"
                      }`}
                    >
                      {placeLabel(game.place)}
                    </span>{" "}
                    из {game.players} · <b className="text-white">{game.score}</b> очков
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
