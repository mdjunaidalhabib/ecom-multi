# Playwright এর official image — Chromium + দরকারি সব system library (fonts, libnss3, libatk ইত্যাদি) আগে থেকেই ইনস্টল করা থাকে
FROM mcr.microsoft.com/playwright:v1.62.1-jammy

WORKDIR /app

# শুধু package files আগে কপি করলে npm ci layer cache হয়, পরের builds অনেক দ্রুত হবে
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4000
CMD ["node", "server.js"]