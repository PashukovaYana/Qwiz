"use client"; // конструктор квиза работает в браузере

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Close, Loader } from "@/components/Icons";

// Заготовки пустых элементов
const emptyAnswer = () => ({ text: "", isCorrect: false });
const emptyQuestion = () => ({
  text: "",
  type: "single", // single = один ответ, multiple = несколько
  imageUrl: "",
  answers: [emptyAnswer(), emptyAnswer()],
});

const CATEGORIES = ["Общие знания", "История", "Наука", "Спорт", "Кино", "Музыка", "Другое"];

export default function NewQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [seconds, setSeconds] = useState(20);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Обновить одно поле вопроса
  function updateQuestion(qi, patch) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  }

  // Обновить текст варианта ответа
  function updateAnswerText(qi, ai, text) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, answers: q.answers.map((a, j) => (j === ai ? { ...a, text } : a)) }
          : q
      )
    );
  }

  // Отметить вариант правильным. Для типа "single" — только один правильный.
  function toggleCorrect(qi, ai) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const answers = q.answers.map((a, j) => {
          if (q.type === "single") {
            return { ...a, isCorrect: j === ai }; // остальные снимаем
          }
          return j === ai ? { ...a, isCorrect: !a.isCorrect } : a;
        });
        return { ...q, answers };
      })
    );
  }

  // При смене типа вопроса сбрасываем правильные ответы (чтобы не было конфликтов)
  function changeType(qi, type) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, type, answers: q.answers.map((a) => ({ ...a, isCorrect: false })) }
          : q
      )
    );
  }

  function addAnswer(qi) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, answers: [...q.answers, emptyAnswer()] } : q))
    );
  }

  function removeAnswer(qi, ai) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi && q.answers.length > 2
          ? { ...q, answers: q.answers.filter((_, j) => j !== ai) }
          : q
      )
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(qi) {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== qi) : prev));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, secondsPerQuestion: seconds, questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось сохранить квиз");
        return;
      }
      router.push(`/organizer/${data.quizId}`);
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-surface-deep/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> В кабинет
          </Link>
          <span className="font-bold text-white">Новый квиз</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Общие настройки квиза */}
          <div className="panel p-6">
            <label className="block">
              <span className="label">Название квиза</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Квиз про космос"
                className="input"
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Категория</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Время на вопрос (секунд)</span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={seconds}
                  onChange={(e) => setSeconds(Number(e.target.value))}
                  className="input"
                />
              </label>
            </div>
          </div>

          {/* Список вопросов */}
          {questions.map((q, qi) => (
            <div key={qi} className="panel p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/15 text-sm font-black text-brand-light">
                    {qi + 1}
                  </span>
                  Вопрос
                </h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qi)}
                    className="text-sm font-semibold text-red-400 transition hover:text-red-300"
                  >
                    Удалить вопрос
                  </button>
                )}
              </div>

              <label className="mt-4 block">
                <span className="label">Текст вопроса</span>
                <input
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                  placeholder="Введите вопрос"
                  className="input"
                />
              </label>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Тип ответа</span>
                  <select
                    value={q.type}
                    onChange={(e) => changeType(qi, e.target.value)}
                    className="input"
                  >
                    <option value="single">Один правильный ответ</option>
                    <option value="multiple">Несколько правильных</option>
                  </select>
                </label>
                <label className="block">
                  <span className="label">Ссылка на картинку (необязательно)</span>
                  <input
                    value={q.imageUrl}
                    onChange={(e) => updateQuestion(qi, { imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="input"
                  />
                </label>
              </div>

              {/* Предпросмотр картинки */}
              {q.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={q.imageUrl}
                  alt="Предпросмотр"
                  className="mt-3 max-h-40 rounded-xl border border-slate-800 object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : null}

              {/* Варианты ответов */}
              <div className="mt-4 space-y-2">
                <span className="label">
                  Варианты ответа{" "}
                  <span className="text-slate-600">(отметьте правильные)</span>
                </span>
                {q.answers.map((a, ai) => (
                  <div key={ai} className="flex items-center gap-2">
                    <input
                      type={q.type === "single" ? "radio" : "checkbox"}
                      checked={a.isCorrect}
                      onChange={() => toggleCorrect(qi, ai)}
                      className="h-5 w-5 accent-brand"
                    />
                    <input
                      value={a.text}
                      onChange={(e) => updateAnswerText(qi, ai, e.target.value)}
                      placeholder={`Вариант ${ai + 1}`}
                      className="input flex-1 py-2"
                    />
                    {q.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(qi, ai)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
                        title="Удалить вариант"
                      >
                        <Close className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addAnswer(qi)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-light transition hover:text-accent"
                >
                  <Plus className="h-4 w-4" /> Добавить вариант
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-700 py-4 font-semibold text-slate-400 transition hover:border-brand hover:text-brand-light"
          >
            <Plus className="h-5 w-5" /> Добавить вопрос
          </button>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <>
                  <Loader className="h-5 w-5" /> Сохраняем…
                </>
              ) : (
                "Сохранить квиз"
              )}
            </button>
            <Link href="/dashboard" className="btn-secondary">
              Отмена
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
