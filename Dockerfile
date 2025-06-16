FROM node:20-slim

# Встановлюємо необхідні залежності для Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxinerama1 \
    libpango-1.0-0 \
    libdrm2 \
    libxfixes3 \
    libgbm1 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Встановлюємо змінну для використання локального Chromium
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Робоча директорія
WORKDIR /app

# Копіюємо package.json і встановлюємо залежності
COPY package*.json ./
RUN npm install

# Копіюємо весь код
COPY . .

# Встановлюємо Chromium з усіма залежностями (важливо для Railway)
RUN npx playwright install --with-deps

# Запускаємо сервер
CMD ["npm", "start"]
