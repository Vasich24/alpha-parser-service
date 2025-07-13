# Базовий образ
FROM node:20-slim

# Встановлюємо змінні оточення
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо залежності
COPY package*.json ./

# Встановлюємо залежності проєкту
RUN npm install && npm cache clean --force

# Копіюємо код проєкту
COPY . .

# Встановлюємо Chromium і його залежності
RUN npx playwright install --with-deps

# Healthcheck (опціонально)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8080/api/wallet-info?address=0x0000000000000000000000000000000000000000 || exit 1

# Відкриваємо порт
EXPOSE 8080

# Запускаємо сервер
CMD ["npm", "start"]
