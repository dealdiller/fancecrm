FROM node:22-alpine

WORKDIR /app
COPY package.json server.js index.html styles.css app.js robots.txt sitemap.xml vercel.json ./
COPY public ./public
COPY docs ./docs
COPY backend ./backend
COPY frontend ./frontend
COPY prisma ./prisma

ENV PORT=4173
EXPOSE 4173

CMD ["node", "server.js"]
