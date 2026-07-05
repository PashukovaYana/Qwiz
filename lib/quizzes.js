// Работа с квизами в базе: создание, список, получение с вопросами.

const db = require("./db");

// Создать квиз вместе с вопросами и ответами (всё в одной транзакции)
function createQuiz({ organizerId, title, category, secondsPerQuestion, questions }) {
  const insertQuiz = db.prepare(
    "INSERT INTO quizzes (organizer_id, title, category, seconds_per_question) VALUES (?, ?, ?, ?)"
  );
  const insertQuestion = db.prepare(
    "INSERT INTO questions (quiz_id, type, text, image_url, position) VALUES (?, ?, ?, ?, ?)"
  );
  const insertAnswer = db.prepare(
    "INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)"
  );

  // Транзакция: либо сохраняется всё, либо ничего (если ошибка)
  db.exec("BEGIN");
  try {
    const quizInfo = insertQuiz.run(
      organizerId,
      title.trim(),
      category || null,
      secondsPerQuestion
    );
    const quizId = Number(quizInfo.lastInsertRowid);

    questions.forEach((q, index) => {
      const qInfo = insertQuestion.run(
        quizId,
        q.type,
        q.text.trim(),
        q.imageUrl ? q.imageUrl.trim() : null,
        index
      );
      const questionId = Number(qInfo.lastInsertRowid);
      q.answers.forEach((a) => {
        insertAnswer.run(questionId, a.text.trim(), a.isCorrect ? 1 : 0);
      });
    });

    db.exec("COMMIT");
    return quizId;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

// Список квизов организатора (с количеством вопросов)
function getQuizzesByOrganizer(organizerId) {
  return db
    .prepare(
      `SELECT q.id, q.title, q.category, q.seconds_per_question AS secondsPerQuestion,
              (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS questionCount
       FROM quizzes q
       WHERE q.organizer_id = ?
       ORDER BY q.id DESC`
    )
    .all(organizerId);
}

// Получить один квиз со всеми вопросами и ответами
function getQuizWithQuestions(quizId) {
  const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(quizId);
  if (!quiz) return null;

  const questions = db
    .prepare("SELECT * FROM questions WHERE quiz_id = ? ORDER BY position")
    .all(quizId);

  for (const q of questions) {
    q.answers = db
      .prepare("SELECT * FROM answers WHERE question_id = ? ORDER BY id")
      .all(q.id);
  }
  quiz.questions = questions;
  return quiz;
}

module.exports = {
  createQuiz,
  getQuizzesByOrganizer,
  getQuizWithQuestions,
};
