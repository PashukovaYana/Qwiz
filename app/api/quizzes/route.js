// API квизов: POST /api/quizzes — создать; GET /api/quizzes — список своих
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { createQuiz, getQuizzesByOrganizer } from "@/lib/quizzes";

export const runtime = "nodejs";

export async function POST(request) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Нужно войти" }, { status: 401 });
  }
  if (user.role !== "organizer") {
    return NextResponse.json(
      { error: "Создавать квизы могут только организаторы" },
      { status: 403 }
    );
  }

  const { title, category, secondsPerQuestion, questions } = await request.json();

  // Проверки корректности данных
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Введите название квиза" }, { status: 400 });
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "Добавьте хотя бы один вопрос" }, { status: 400 });
  }
  const seconds = Number(secondsPerQuestion) || 20;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const num = i + 1;
    if (!q.text || !q.text.trim()) {
      return NextResponse.json({ error: `Вопрос ${num}: введите текст` }, { status: 400 });
    }
    if (q.type !== "single" && q.type !== "multiple") {
      return NextResponse.json({ error: `Вопрос ${num}: неверный тип` }, { status: 400 });
    }
    const answers = Array.isArray(q.answers) ? q.answers.filter((a) => a.text && a.text.trim()) : [];
    if (answers.length < 2) {
      return NextResponse.json(
        { error: `Вопрос ${num}: нужно минимум 2 варианта ответа` },
        { status: 400 }
      );
    }
    if (!answers.some((a) => a.isCorrect)) {
      return NextResponse.json(
        { error: `Вопрос ${num}: отметьте хотя бы один правильный ответ` },
        { status: 400 }
      );
    }
    q.answers = answers; // оставляем только непустые варианты
  }

  const quizId = createQuiz({
    organizerId: user.id,
    title,
    category,
    secondsPerQuestion: seconds,
    questions,
  });

  return NextResponse.json({ ok: true, quizId });
}

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Нужно войти" }, { status: 401 });
  }
  const quizzes = getQuizzesByOrganizer(user.id);
  return NextResponse.json({ ok: true, quizzes });
}
