import Link from "next/link";
import { Logo, Play, Bolt, Users, Trophy } from "@/components/Icons";

// Главная страница — «технологичный» лендинг платформы
export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Размытые синие пятна для глубины */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Логотип */}
        <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 backdrop-blur">
          <span className="flex h-2 w-2 rounded-full bg-accent shadow-glow animate-pulse-ring" />
          Реальное время · WebSocket
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-accent text-white shadow-glow animate-float">
          <Logo className="h-10 w-10" />
        </div>

        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
          Quiz{" "}
          <span className="bg-gradient-to-r from-brand-light to-accent bg-clip-text text-transparent">
            Arena
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-slate-400">
          Создавайте квизы и проводите их в реальном времени. Участники подключаются
          по коду комнаты — как на большой сцене.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary px-8 py-3.5 text-base">
            <Bolt className="h-5 w-5" /> Начать
          </Link>
          <Link href="/join" className="btn-secondary px-8 py-3.5 text-base">
            <Play className="h-5 w-5" /> Войти в игру
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-brand-light hover:underline">
            Войти
          </Link>
        </p>

        {/* Три «фичи» — характер платформы */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <Feature icon={<Bolt className="h-6 w-6" />} title="Мгновенно" text="Вопросы у всех одновременно, ответы — по таймеру" />
          <Feature icon={<Users className="h-6 w-6" />} title="По коду" text="Участники входят по короткому коду комнаты" />
          <Feature icon={<Trophy className="h-6 w-6" />} title="Лидерборд" text="Очки за скорость и живой рейтинг игроков" />
        </div>
      </div>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="panel p-5 text-left">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-brand-light">
        {icon}
      </div>
      <h3 className="mt-3 font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}
