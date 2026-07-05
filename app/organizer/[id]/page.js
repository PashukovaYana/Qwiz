// Просмотр одного квиза организатором + кнопка запуска игры.
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { getQuizWithQuestions } from "@/lib/quizzes";
import { ArrowLeft, Play, Clock, Layers, Check } from "@/components/Icons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function QuizPage({ params }) {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  const quiz = getQuizWithQuestions(Number(params.id));
  if (!quiz) notFound();
  // Чужой квиз смотреть нельзя
  if (quiz.organizer_id !== user.id) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-surface-deep/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> В кабинет
          </Link>
          <span className="font-bold text-white">Квиз</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="panel p-6">
          <h1 className="text-2xl font-black text-white">{quiz.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="pill"><Layers className="h-3.5 w-3.5" /> {quiz.category || "Без категории"}</span>
            <span className="pill"><Clock className="h-3.5 w-3.5" /> {quiz.seconds_per_question} сек. на вопрос</span>
            <span className="pill">{quiz.questions.length} вопрос(ов)</span>
          </div>
          <Link href={`/organizer/${quiz.id}/host`} className="btn-primary mt-5">
            <Play className="h-5 w-5" /> Запустить квиз
          </Link>
        </div>

        {/* Список вопросов */}
        <div className="mt-6 space-y-4">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="panel p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="flex items-start gap-2 font-bold text-white">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-sm font-black text-brand-light">
                    {i + 1}
                  </span>
                  {q.text}
                </h3>
                <span className="pill shrink-0">
                  {q.type === "single" ? "один ответ" : "несколько"}
                </span>
              </div>

              {q.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={q.image_url}
                  alt=""
                  className="mt-3 max-h-40 rounded-xl border border-slate-800 object-contain"
                />
              ) : null}

              <ul className="mt-4 space-y-1.5">
                {q.answers.map((a) => (
                  <li
                    key={a.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      a.is_correct
                        ? "border border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-300"
                        : "border border-slate-800 bg-slate-950/40 text-slate-400"
                    }`}
                  >
                    {a.is_correct ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                    )}
                    {a.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
