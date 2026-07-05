"use client"; // экран ведущего (организатора)

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import Link from "next/link";
import { Play, ArrowRight, ArrowLeft, Trophy, Users, Loader, Check } from "@/components/Icons";

export default function HostPage() {
  const params = useParams();
  const quizId = params.id;

  const socketRef = useRef(null);
  const [phase, setPhase] = useState("connecting"); // connecting|lobby|question|reveal|finished|error
  const [errorMsg, setErrorMsg] = useState("");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState(0);
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState({ answered: 0, total: 0 });
  const [reveal, setReveal] = useState(null);
  const [board, setBoard] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("host_create", { quizId });
    });
    socket.on("host_created", (data) => {
      setCode(data.code);
      setTitle(data.title);
      setTotal(data.total);
      setPhase("lobby");
    });
    socket.on("error_msg", (msg) => {
      setErrorMsg(msg);
      setPhase("error");
    });
    socket.on("players", (list) => setPlayers(list));
    socket.on("question", (q) => {
      setQuestion(q);
      setReveal(null);
      setAnswered({ answered: 0, total: players.length });
      setPhase("question");
    });
    socket.on("answered_count", (c) => setAnswered(c));
    socket.on("reveal", (data) => {
      setReveal(data);
      setPhase("reveal");
    });
    socket.on("finished", (data) => {
      setBoard(data.leaderboard);
      setPhase("finished");
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Таймер вопроса
  useEffect(() => {
    if (phase !== "question" || !question) return;
    const tick = () => setTimeLeft(Math.max(0, Math.ceil((question.deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, [phase, question]);

  const emit = (event) => socketRef.current?.emit(event);

  // --- Экраны ---

  if (phase === "error") {
    return (
      <Centered>
        <p className="text-lg font-bold text-red-400">{errorMsg}</p>
        <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1.5 text-brand-light hover:underline">
          <ArrowLeft className="h-4 w-4" /> В кабинет
        </Link>
      </Centered>
    );
  }

  if (phase === "connecting") {
    return (
      <Centered>
        <Loader className="h-8 w-8 text-brand-light" />
        <p className="mt-3 text-slate-400">Создаём комнату…</p>
      </Centered>
    );
  }

  if (phase === "lobby") {
    return (
      <Centered>
        <p className="text-slate-400">{title}</p>
        <p className="mt-2 text-sm text-slate-500">Код комнаты для участников:</p>
        <div className="mt-3 rounded-2xl border border-brand/40 bg-slate-900/60 px-10 py-5 shadow-glow">
          <span className="code-chip text-5xl sm:text-6xl">{code}</span>
        </div>
        <p className="mt-4 max-w-sm text-sm text-slate-400">
          Участники заходят на страницу «Войти в игру» и вводят этот код.
        </p>

        <div className="mt-8 w-full max-w-md">
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-300">
            <Users className="h-4 w-4 text-brand-light" /> Участники ({players.length})
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {players.length === 0 ? (
              <span className="text-sm text-slate-500">Пока никто не подключился…</span>
            ) : (
              players.map((p, i) => (
                <span key={i} className="pill text-sm">{p.name}</span>
              ))
            )}
          </div>
        </div>

        <button
          onClick={() => emit("host_next")}
          disabled={players.length === 0}
          className="btn-primary mt-8 px-8"
        >
          <Play className="h-5 w-5" /> Начать игру
        </button>
      </Centered>
    );
  }

  if (phase === "finished") {
    return (
      <Centered>
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent text-white">
          <Trophy className="h-8 w-8" />
        </span>
        <h1 className="mt-3 text-3xl font-black text-white">Итоги квиза</h1>
        <p className="mt-1 text-slate-400">{title}</p>
        <BigLeaderboard board={board} />
        <Link href="/dashboard" className="mt-6 inline-flex items-center gap-1.5 text-brand-light hover:underline">
          <ArrowLeft className="h-4 w-4" /> В кабинет
        </Link>
      </Centered>
    );
  }

  // Вопрос / показ ответа
  const q = question;
  const isReveal = phase === "reveal";
  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Вопрос {q.index + 1} из {q.total} · комната{" "}
            <span className="font-mono font-bold text-brand-light">{code}</span>
          </span>
          {phase === "question" && (
            <span className="rounded-full bg-gradient-to-r from-brand to-accent px-3 py-1 font-bold text-white">
              {timeLeft} сек
            </span>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-black text-white">{q.text}</h1>
        {q.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={q.imageUrl} alt="" className="mt-4 max-h-60 rounded-xl border border-slate-800 object-contain" />
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {q.answers.map((a, ai) => {
            const correct = isReveal && reveal?.correctIds.includes(a.id);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-2xl px-4 py-4 font-semibold ${
                  correct
                    ? "bg-emerald-500 text-white"
                    : "border border-slate-700 bg-slate-900/60 text-slate-100"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/25 text-sm font-black">
                  {String.fromCharCode(65 + ai)}
                </span>
                <span className="flex-1">{a.text}</span>
                {isReveal && correct ? <Check className="h-5 w-5 shrink-0" /> : null}
              </div>
            );
          })}
        </div>

        {phase === "question" && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-slate-400">
              Ответили: <b className="text-white">{answered.answered}</b> из {answered.total}
            </span>
            <button onClick={() => emit("host_reveal")} className="btn-secondary py-2">
              Показать ответ
            </button>
          </div>
        )}

        {isReveal && (
          <div className="mt-6">
            <BigLeaderboard board={reveal.leaderboard} />
            <button onClick={() => emit("host_next")} className="btn-primary mt-6 w-full">
              {reveal.isLast ? (
                <>
                  <Trophy className="h-5 w-5" /> Показать итоги
                </>
              ) : (
                <>
                  Следующий вопрос <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Centered({ children }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {children}
    </main>
  );
}

function BigLeaderboard({ board }) {
  return (
    <div className="mx-auto mt-4 w-full max-w-md space-y-2">
      {board.length === 0 && <p className="text-slate-500">Нет участников</p>}
      {board.map((p, i) => (
        <div
          key={i}
          className={`flex items-center justify-between rounded-xl px-5 py-3 ${
            i === 0
              ? "border border-accent/40 bg-accent/10 shadow-glow"
              : "border border-slate-800 bg-slate-900/60"
          }`}
        >
          <span className="flex items-center gap-3 font-semibold text-white">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black ${
                i === 0 ? "bg-gradient-to-br from-brand to-accent text-white" : "bg-slate-800 text-slate-300"
              }`}
            >
              {i + 1}
            </span>
            {p.name}
          </span>
          <span className="font-bold text-brand-light">{p.score}</span>
        </div>
      ))}
    </div>
  );
}
