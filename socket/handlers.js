// Обработчики Socket.IO — вся логика реальной игры.

const { parse: parseCookie } = require("cookie");
const { createGame, getGame, removeGame } = require("../lib/game");
const { getQuizWithQuestions } = require("../lib/quizzes");
const { getUserByToken } = require("../lib/auth");
const db = require("../lib/db");

// Определить, вошёл ли игрок в аккаунт.
// Браузер при подключении к сокету присылает те же cookie, что и обычным страницам,
// поэтому читаем cookie сессии прямо из «рукопожатия» (handshake) сокета.
// Вернём id пользователя (или null, если это гость без входа).
function getUserIdFromSocket(socket) {
  try {
    const cookies = parseCookie(socket.handshake.headers.cookie || "");
    const user = getUserByToken(cookies.session);
    return user ? user.id : null;
  } catch {
    return null;
  }
}

// --- Вспомогательные функции ---

// Список участников для показа в лобби
function playerList(game) {
  return [...game.players.values()].map((p) => ({ name: p.name }));
}

// Сколько участников уже ответили
function answeredCount(game) {
  let answered = 0;
  for (const p of game.players.values()) if (p.answered) answered++;
  return { answered, total: game.players.size };
}

// Все ли ответили
function allAnswered(game) {
  if (game.players.size === 0) return false;
  for (const p of game.players.values()) if (!p.answered) return false;
  return true;
}

// Вопрос БЕЗ пометки правильных ответов (чтобы участники не подсмотрели)
function publicQuestion(game) {
  const q = game.questions[game.currentIndex];
  return {
    index: game.currentIndex,
    total: game.questions.length,
    text: q.text,
    type: q.type,
    imageUrl: q.image_url,
    seconds: game.secondsPerQuestion,
    deadline: game.deadline,
    answers: q.answers.map((a) => ({ id: a.id, text: a.text })),
  };
}

// Таблица результатов, отсортированная по очкам
function leaderboard(game) {
  return [...game.players.values()]
    .map((p) => ({ name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

// --- Переходы состояний игры ---

function nextQuestion(io, game) {
  if (game.timer) clearTimeout(game.timer);
  game.currentIndex += 1;

  // Вопросы кончились — завершаем игру
  if (game.currentIndex >= game.questions.length) {
    finishGame(io, game);
    return;
  }

  game.status = "question";
  for (const p of game.players.values()) p.answered = false; // сбрасываем отметки
  game.deadline = Date.now() + game.secondsPerQuestion * 1000;

  io.to(game.code).emit("question", publicQuestion(game));

  // Автоматически показать правильный ответ, когда время выйдет
  game.timer = setTimeout(() => revealQuestion(io, game), game.secondsPerQuestion * 1000);
}

function revealQuestion(io, game) {
  if (game.status !== "question") return; // уже показали
  if (game.timer) {
    clearTimeout(game.timer);
    game.timer = null;
  }
  game.status = "reveal";
  const q = game.questions[game.currentIndex];
  const correctIds = q.answers.filter((a) => a.is_correct).map((a) => a.id);

  io.to(game.code).emit("reveal", {
    correctIds,
    leaderboard: leaderboard(game),
    isLast: game.currentIndex === game.questions.length - 1,
  });
}

function finishGame(io, game) {
  game.status = "finished";
  const board = leaderboard(game); // для клиентов: только имя и очки

  // Полный список с userId (только для сохранения в базу, клиентам не отправляем)
  const ranked = [...game.players.values()]
    .map((p) => ({ name: p.name, score: p.score, userId: p.userId ?? null }))
    .sort((a, b) => b.score - a.score);

  // Сохраняем итоги в базу
  try {
    db.prepare("UPDATE games SET status = ?, finished_at = datetime('now') WHERE id = ?").run(
      "finished",
      game.dbGameId
    );
    const insertResult = db.prepare(
      "INSERT INTO game_results (game_id, user_id, nickname, score, place) VALUES (?, ?, ?, ?, ?)"
    );
    ranked.forEach((p, i) => insertResult.run(game.dbGameId, p.userId, p.name, p.score, i + 1));
  } catch (e) {
    console.error("Ошибка сохранения итогов:", e);
  }

  io.to(game.code).emit("finished", { leaderboard: board });
  removeGame(game.code);
}

// --- Подсчёт правильности ответа ---

function checkAnswer(question, chosenIds) {
  const correct = question.answers.filter((a) => a.is_correct).map((a) => a.id).sort((a, b) => a - b);
  const chosen = [...new Set((chosenIds || []).map(Number))].sort((a, b) => a - b);
  if (correct.length !== chosen.length) return false;
  return correct.every((id, i) => id === chosen[i]);
}

// --- Регистрация всех обработчиков ---

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    // ОРГАНИЗАТОР создаёт комнату
    socket.on("host_create", ({ quizId }) => {
      const quiz = getQuizWithQuestions(Number(quizId));
      if (!quiz || quiz.questions.length === 0) {
        socket.emit("error_msg", "Квиз не найден или в нём нет вопросов");
        return;
      }
      const game = createGame(quiz);
      game.hostSocketId = socket.id;

      const info = db
        .prepare("INSERT INTO games (quiz_id, room_code, status) VALUES (?, ?, ?)")
        .run(quiz.id, game.code, "waiting");
      game.dbGameId = Number(info.lastInsertRowid);

      socket.join(game.code);
      socket.data.code = game.code;
      socket.data.role = "host";
      socket.emit("host_created", {
        code: game.code,
        title: game.title,
        total: game.questions.length,
      });
    });

    // УЧАСТНИК входит по коду
    socket.on("player_join", ({ code, name }) => {
      code = (code || "").toUpperCase().trim();
      const game = getGame(code);
      if (!game) {
        socket.emit("error_msg", "Комната с таким кодом не найдена");
        return;
      }
      if (game.status !== "waiting") {
        socket.emit("error_msg", "Игра уже началась — подключиться нельзя");
        return;
      }
      const cleanName = (name || "").trim().slice(0, 20) || "Игрок";
      // Если игрок вошёл в аккаунт — запомним его id, чтобы игра попала в его историю
      const userId = getUserIdFromSocket(socket);
      game.players.set(socket.id, { name: cleanName, score: 0, answered: false, userId });
      socket.join(code);
      socket.data.code = code;
      socket.data.role = "player";

      socket.emit("joined", { code, title: game.title });
      io.to(code).emit("players", playerList(game));
    });

    // ОРГАНИЗАТОР: начать игру / следующий вопрос
    socket.on("host_next", () => {
      const game = getGame(socket.data.code);
      if (!game || socket.id !== game.hostSocketId) return;
      nextQuestion(io, game);
    });

    // ОРГАНИЗАТОР: досрочно показать ответ (не дожидаясь таймера)
    socket.on("host_reveal", () => {
      const game = getGame(socket.data.code);
      if (!game || socket.id !== game.hostSocketId) return;
      revealQuestion(io, game);
    });

    // УЧАСТНИК присылает ответ
    socket.on("submit_answer", ({ answerIds }) => {
      const game = getGame(socket.data.code);
      if (!game || game.status !== "question") return;
      const player = game.players.get(socket.id);
      if (!player || player.answered) return;
      if (Date.now() > game.deadline) return; // время вышло — не принимаем

      player.answered = true;
      const q = game.questions[game.currentIndex];
      const isCorrect = checkAnswer(q, answerIds);

      let gained = 0;
      if (isCorrect) {
        // Быстрее ответил — больше очков (от 500 до 1000)
        const timeLeft = Math.max(0, game.deadline - Date.now());
        const ratio = timeLeft / (game.secondsPerQuestion * 1000);
        gained = Math.round(500 + 500 * ratio);
        player.score += gained;
      }

      socket.emit("answer_received", { isCorrect, gained });
      io.to(game.code).emit("answered_count", answeredCount(game));

      // Если ответили все — показываем результат сразу
      if (allAnswered(game)) revealQuestion(io, game);
    });

    // Отключение
    socket.on("disconnect", () => {
      const code = socket.data.code;
      if (!code) return;
      const game = getGame(code);
      if (!game) return;

      if (socket.id === game.hostSocketId) {
        // Ушёл организатор — завершаем игру для всех
        io.to(code).emit("host_left");
        removeGame(code);
      } else if (game.players.has(socket.id)) {
        game.players.delete(socket.id);
        io.to(code).emit("players", playerList(game));
      }
    });
  });
}

module.exports = { registerSocketHandlers };
