// Логика авторизации: создание пользователей, проверка паролей и сессии.

const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const db = require("./db");

// Создать нового пользователя (пароль сразу хешируем — в базе не хранится открытый)
function createUser({ email, password, name, role }) {
  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)"
    )
    .run(email.toLowerCase().trim(), passwordHash, name.trim(), role);
  return getUserById(Number(info.lastInsertRowid));
}

// Найти пользователя по email
function findUserByEmail(email) {
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase().trim());
}

// Найти пользователя по id
function getUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

// Проверить пароль при входе
function verifyPassword(password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash);
}

// Создать сессию (случайный токен) и вернуть его — он попадёт в cookie
function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(
    token,
    userId
  );
  return token;
}

// Получить пользователя по токену сессии (без пароля)
function getUserByToken(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT users.id, users.email, users.name, users.role
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ?`
    )
    .get(token);
  return row || null;
}

// Удалить сессию (выход)
function deleteSession(token) {
  if (!token) return;
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

module.exports = {
  createUser,
  findUserByEmail,
  getUserById,
  verifyPassword,
  createSession,
  getUserByToken,
  deleteSession,
};
