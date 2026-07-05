"use client"; // игровой экран участника

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import Link from "next/link";
import { Loader, Flag, Check, Bolt, ArrowLeft } from "@/components/Icons";

export default function PlayPage() {
  const params = useParams();
  const search = useSearchParams();
  const code = String(params.code || "").toUpperCase();
  const name = search.get("name") || "Игрок";

  const socketRef = useRef(null);
  const [status, setStatus] = useState("connecting"); // connecting|waiting|question|answered|reveal|finished|error
  const [errorMsg, setErrorMsg] = useState("");
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null); // {isCorrect, gained}
  const [reveal, setReveal] = useState(null); // {correctIds, leaderboard, isLast}
  const [board, setBoard] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Подключение к серверу (один раз)
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("player_join", { code, name });
    });
    socket.on("joined", () => setStatus("waiting"));
    socket.on("error_msg", (msg) => {
      setErrorMsg(msg);
      setStatus("error");
    });
    socket.on("question", (q) => {
      setQuestion(q);
      setSelected([]);
      setResult(null);
      setReveal(null);
      setStatus("question");
    });
    socket.on("answer_received", (r) => {
      setResult(r);
      setStatus("answered");
    });
    socket.on("reveal", (data) => {
      setReveal(data);
      setStatus("reveal");
    });
    socket.on("finished", (data) => {
      setBoard(data.leaderboard);
      setStatus("finished");
    });
    socket.on("host_left", () => {
      setErrorMsg("Организатор завершил игру");
      setStatus("error");
    });

    return () => socket.disconnect();
  }, [code, name]);

  // Отсчёт времени на вопрос
  useEffect(() => {
    if (status !== "question" || !question) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((question.deadline - Date.now()) / 1000));
      setTimeLeft(left);
    };
    tick();
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, [status, question]);

  function submit(ids) {
    socketRef.current?.emit("submit_answer", { answerIds: ids });
  }

  function pickSingle(id) {
    setSelected([id]);
    submit([id]); // один ответ — отправляем сразу
  }

  function toggleMultiple(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // --- Экраны по состояниям ---

  if (status === "error") {
    return (
      <Centered>
        <p className="text-lg font-bold text-red-400">{errorMsg}</p>
        <Link href="/join" className="mt-4 inline-flex items-center gap-1.5 text-brand-light hover:underline">
          <ArrowLeft className="h-4 w-4" /> Ввести код заново
        </Link>
      </Centered>
    );
  }

  if (status === "connecting") {
    return (
      <Centered>
        <Loader className="h-8 w-8 text-brand-light" />
        <p className="mt-3 text-slate-400">Подключаемся…</p>
      </Centered>
    );
  }

  if (status === "waiting") {
    return (
      <Centered>
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/15 text-brand-light">
          <Loader className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-black text-white">Вы в игре</h1>
        <p className="mt-2 text-slate-400">{name}, ждём, пока организатор начнёт квиз…</p>
        <p className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 font-mono text-sm text-slate-300">
          Комната <span className="code-chip">{code}</span>
        </p>
      </Centered>
    );
  }

  if (status === "finished") {
    const me = board.findIndex((p) => p.name === name);
    return (
      <Centered>
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent text-white">
          <Flag className="h-8 w-8" />
        </span>
        <h1 className="mt-3 text-2xl font-black text-white">Игра окончена</h1>
        {me >= 0 && (
          <p className="mt-2 text-slate-300">
            Ваше место: <b className="text-white">{me + 1}</b> · очки:{" "}
            <b className="text-white">{board[me].score}</b>
          </p>
        )}
        <Leaderboard board={board} highlight={name} />
        <Link href="/join" className="mt-6 text-brand-light hover:underline">
          Сыграть ещё
        </Link>
      </Centered>
    );
  }

  // Вопрос или показ ответа
  const isReveal = status === "reveal";
  const q = question;
  if (!q) return <Centered><p className="text-slate-400">Загрузка…</p></Centered>;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* Шапка вопроса */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Вопрос {q.index + 1} из {q.total}</span>
          {status === "question" && (
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-accent px-3 py-1 font-bold text-white">
              {timeLeft} сек
            </span>
          )}
        </div>

        {/* Полоса таймера */}
        {status === "question" && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-300 ease-linear"
              style={{ width: `${(timeLeft / q.seconds) * 100}%` }}
            />
          </div>
        )}

        <h1 className="mt-4 text-2xl font-black text-white">{q.text}</h1>
        {q.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={q.imageUrl} alt="" className="mt-4 max-h-52 rounded-xl border border-slate-800 object-contain" />
        ) : null}

        {/* Уже ответил — ждём остальных */}
        {status === "answered" && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Check className="h-6 w-6" />
            </span>
            <p className="mt-3 text-lg font-semibold text-white">Ответ принят</p>
            <p className="mt-1 text-sm text-slate-400">Ждём остальных участников…</p>
          </div>
        )}

        {/* Кнопки ответов */}
        {(status === "question" || isReveal) && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q.answers.map((a, ai) => {
              const chosen = selected.includes(a.id);
              const correct = isReveal && reveal?.correctIds.includes(a.id);
              const wrongChosen = isReveal && chosen && !correct;
              return (
                <button
                  key={a.id}
                  disabled={status !== "question"}
                  onClick={() =>
                    q.type === "single" ? pickSingle(a.id) : toggleMultiple(a.id)
                  }
                  className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-left font-semibold transition ${
                    correct
                      ? "bg-emerald-500 text-white"
                      : wrongChosen
                      ? "bg-red-500/80 text-white"
                      : chosen
                      ? "bg-gradient-to-r from-brand to-accent text-white shadow-glow"
                      : "border border-slate-700 bg-slate-900/60 text-slate-100 hover:-translate-y-0.5 hover:border-brand/50 hover:bg-slate-800"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/25 text-sm font-black">
                    {String.fromCharCode(65 + ai)}
                  </span>
                  <span className="flex-1">{a.text}</span>
                  {isReveal && correct ? <Check className="h-5 w-5 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        )}

        {/* Кнопка "Ответить" для множественного выбора */}
        {status === "question" && q.type === "multiple" && (
          <button
            onClick={() => submit(selected)}
            disabled={selected.length === 0}
            className="btn-primary mt-4 w-full"
          >
            Ответить
          </button>
        )}

        {/* Результат после показа ответа */}
        {isReveal && (
          <div className="mt-6">
            {result ? (
              <p
                className={`flex items-center justify-center gap-2 text-center text-lg font-bold ${
                  result.isCorrect ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {result.isCorrect ? (
                  <>
                    <Bolt className="h-5 w-5" /> Верно! +{result.gained} очков
                  </>
                ) : (
                  "Неверно"
                )}
              </p>
            ) : (
              <p className="text-center text-slate-400">Вы не успели ответить</p>
            )}
            <Leaderboard board={reveal.leaderboard} highlight={name} />
            <p className="mt-4 text-center text-sm text-slate-500">
              {reveal.isLast ? "Это был последний вопрос…" : "Ждём следующий вопрос…"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Обёртка для центрированных экранов
function Centered({ children }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {children}
    </main>
  );
}

// Таблица результатов
function Leaderboard({ board, highlight }) {
  return (
    <div className="mx-auto mt-4 w-full max-w-sm space-y-1.5">
      {board.map((p, i) => (
        <div
          key={i}
          className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
            p.name === highlight
              ? "border border-brand/50 bg-brand/15 font-bold text-brand-light"
              : "border border-slate-800 bg-slate-900/60 text-slate-200"
          }`}
        >
          <span>
            <span className="text-slate-500">{i + 1}.</span> {p.name}
          </span>
          <span className="font-bold">{p.score}</span>
        </div>
      ))}
    </div>
  );
}
