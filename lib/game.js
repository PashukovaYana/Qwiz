// Хранилище активных игр в памяти сервера.
// Каждая игра живёт, пока идёт квиз; по окончании удаляется.
// Постоянные данные (итоги) отдельно пишутся в базу.

const crypto = require("node:crypto");

const games = new Map(); // код комнаты -> объект игры

// Генерируем короткий код комнаты (без похожих символов 0/O, 1/I)
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[crypto.randomInt(chars.length)]).join("");
  } while (games.has(code));
  return code;
}

// Создать новую игру из квиза (квиз уже загружен из базы вместе с вопросами)
function createGame(quiz) {
  const code = generateCode();
  const game = {
    code,
    quizId: quiz.id,
    title: quiz.title,
    secondsPerQuestion: quiz.seconds_per_question,
    questions: quiz.questions, // [{id, text, type, image_url, answers:[{id,text,is_correct}]}]
    status: "waiting", // waiting | question | reveal | finished
    currentIndex: -1,
    players: new Map(), // socketId -> {name, score, answered}
    deadline: 0, // время (мс), до которого принимаем ответы
    timer: null, // таймер вопроса
    hostSocketId: null,
    dbGameId: null,
  };
  games.set(code, game);
  return game;
}

function getGame(code) {
  return games.get(code);
}

function removeGame(code) {
  const game = games.get(code);
  if (game && game.timer) clearTimeout(game.timer);
  games.delete(code);
}

module.exports = { createGame, getGame, removeGame };
