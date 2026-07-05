// Кастомный сервер: запускает Next.js и Socket.IO на одном порту.
// Socket.IO нужен постоянно живущий процесс — поэтому свой сервер, а не "next dev".

const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./socket/handlers");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT) || 3000;

// Готовим Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Обычный HTTP-сервер, все запросы отдаём в Next
  const httpServer = createServer((req, res) => handle(req, res));

  // Подключаем Socket.IO к тому же серверу
  const io = new Server(httpServer);

  // Вся логика игры (создание комнат, вопросы, ответы, очки)
  registerSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(`> Готово: http://${hostname}:${port}`);
  });
});
