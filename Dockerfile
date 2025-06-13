FROM node:20-slim

# Install only Chromium
RUN apt-get update && apt-get install -y wget ca-certificates fonts-liberation libasound2 libatk1.0-0 \
    libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libx11-6 libxcomposite1 libxdamage1 libxrandr2 \
    xdg-utils --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npx playwright install chromium

CMD ["npm", "start"]
