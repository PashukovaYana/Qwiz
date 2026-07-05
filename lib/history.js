// Запросы к базе для «Истории» в личном кабинете.
// Разделены по ролям: организатор видит проведённые им игры,
// участник — игры, в которых он играл под своим аккаунтом.

const db = require("./db");

// История организатора: завершённые игры по его квизам.
// Для каждой игры показываем название квиза, дату, число игроков и победителя (1-е место).
function getGamesByOrganizer(organizerId) {
  return db
    .prepare(
      `SELECT
         g.id,
         g.finished_at AS finishedAt,
         q.title,
         (SELECT COUNT(*) FROM game_results r WHERE r.game_id = g.id) AS players,
         (SELECT r.nickname FROM game_results r
            WHERE r.game_id = g.id AND r.place = 1 LIMIT 1) AS winner
       FROM games g
       JOIN quizzes q ON q.id = g.quiz_id
       WHERE q.organizer_id = ? AND g.status = 'finished'
       ORDER BY g.finished_at DESC`
    )
    .all(organizerId);
}

// История участника: игры, где он играл войдя в аккаунт (user_id совпадает).
// Показываем название квиза, дату, его место и очки, всего игроков.
function getGamesByParticipant(userId) {
  return db
    .prepare(
      `SELECT
         g.id,
         g.finished_at AS finishedAt,
         q.title,
         r.nickname,
         r.score,
         r.place,
         (SELECT COUNT(*) FROM game_results r2 WHERE r2.game_id = g.id) AS players
       FROM game_results r
       JOIN games g ON g.id = r.game_id
       JOIN quizzes q ON q.id = g.quiz_id
       WHERE r.user_id = ? AND g.status = 'finished'
       ORDER BY g.finished_at DESC`
    )
    .all(userId);
}

// Полные результаты одной игры (для страницы деталей у организатора).
// Возвращаем саму игру (с названием квиза и владельцем) и таблицу мест.
function getGameDetails(gameId) {
  const game = db
    .prepare(
      `SELECT g.id, g.finished_at AS finishedAt, g.status,
              q.title, q.organizer_id AS organizerId
       FROM games g
       JOIN quizzes q ON q.id = g.quiz_id
       WHERE g.id = ?`
    )
    .get(gameId);
  if (!game) return null;

  game.results = db
    .prepare(
      `SELECT place, nickname, score
       FROM game_results
       WHERE game_id = ?
       ORDER BY place`
    )
    .all(gameId);
  return game;
}

module.exports = {
  getGamesByOrganizer,
  getGamesByParticipant,
  getGameDetails,
};
