// Подключение к базе данных SQLite через встроенный модуль Node 24 (node:sqlite).
// База хранится в одном файле data/quiz.db.
//
// ВАЖНО: базу открываем ЛЕНИВО — только при первом реальном обращении (db.prepare/exec
// во время работы приложения), а НЕ при импорте модуля. Иначе во время сборки `next build`
// несколько параллельных процессов одновременно открывают один файл и создают таблицы,
// что приводит к ошибке "database is locked". Ленивая инициализация это исключает.

const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");
const fs = require("node:fs");

let realDb = null; // настоящее подключение появится при первом обращении

// Открыть базу и создать таблицы (выполняется один раз)
function init() {
  if (realDb) return realDb;

  // Папка для файла базы (создаём, если её нет)
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Открываем (или создаём) файл базы
  const db = new DatabaseSync(path.join(dataDir, "quiz.db"));

  // Включаем поддержку внешних ключей (связи между таблицами)
  db.exec("PRAGMA foreign_keys = ON;");

  // Создаём все таблицы сразу (если их ещё нет)
  db.exec(`
    -- Пользователи: участники и организаторы
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'participant', -- 'organizer' | 'participant'
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Сессии входа (какой токен какому пользователю принадлежит)
    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Квизы, созданные организаторами
    CREATE TABLE IF NOT EXISTS quizzes (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      organizer_id         INTEGER NOT NULL,
      title                TEXT NOT NULL,
      category             TEXT,
      seconds_per_question INTEGER NOT NULL DEFAULT 20,
      created_at           TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organizer_id) REFERENCES users(id)
    );

    -- Вопросы квиза
    CREATE TABLE IF NOT EXISTS questions (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id   INTEGER NOT NULL,
      type      TEXT NOT NULL DEFAULT 'single', -- 'single' | 'multiple'
      text      TEXT NOT NULL,
      image_url TEXT,
      position  INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    );

    -- Варианты ответов к вопросам
    CREATE TABLE IF NOT EXISTS answers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      text        TEXT NOT NULL,
      is_correct  INTEGER NOT NULL DEFAULT 0, -- 0 = неверный, 1 = верный
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    -- Проведённые игры (запуски квизов)
    CREATE TABLE IF NOT EXISTS games (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id     INTEGER NOT NULL,
      room_code   TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'waiting', -- 'waiting' | 'running' | 'finished'
      started_at  TEXT,
      finished_at TEXT,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    );

    -- Итоги игр (кто сколько набрал)
    CREATE TABLE IF NOT EXISTS game_results (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id  INTEGER NOT NULL,
      user_id  INTEGER,            -- может быть NULL для гостей
      nickname TEXT NOT NULL,
      score    INTEGER NOT NULL DEFAULT 0,
      place    INTEGER,
      FOREIGN KEY (game_id) REFERENCES games(id)
    );
  `);

  realDb = db;
  return realDb;
}

// Отдаём «прокси»: он выглядит как обычный объект базы (db.prepare, db.exec),
// но открывает реальное подключение только при первом обращении к методу.
// Благодаря этому во время сборки база не открывается (методы не вызываются).
module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      const db = init();
      const value = db[prop];
      return typeof value === "function" ? value.bind(db) : value;
    },
  }
);
