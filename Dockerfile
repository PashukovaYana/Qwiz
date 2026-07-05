# Образ для запуска приложения на Hugging Face Spaces (Docker).
# Фиксируем Node 24 — он нужен для встроенного модуля node:sqlite.
FROM node:24-alpine

WORKDIR /app

# Сначала ставим зависимости (кэшируется, если package.json не менялся)
COPY --chown=node:node package*.json ./
RUN npm install

# Копируем остальной код и собираем production-версию Next.js
COPY --chown=node:node . .
RUN npm run build

# Папка для файла базы SQLite должна быть доступна для записи пользователю node
RUN mkdir -p /app/data && chown -R node:node /app/data

# Запускаемся под непривилегированным пользователем (требование Hugging Face)
USER node

# Hugging Face ожидает приложение на порту 7860
ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server.js"]
