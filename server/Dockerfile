FROM node:lts-alpine3.17

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run db:deploy && npm run dev"]
