FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server ./server
WORKDIR /app/server
RUN npm install

WORKDIR /app
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tsconfig.app.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src/

RUN npm run build:all

EXPOSE 3001

CMD ["node", "server/dist/index.js"]