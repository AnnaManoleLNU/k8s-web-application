# notification/Dockerfile
FROM node:20.8.0-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3002

CMD ["node", "src/server.js"]
