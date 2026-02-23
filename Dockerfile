FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/public ./dist/public

RUN mkdir -p /data/uploads

ENV NODE_ENV=production
ENV PORT=80
ENV DB_PATH=/data/db.sqlite
ENV UPLOADS_DIR=/data/uploads

EXPOSE 80

VOLUME ["/data"]

CMD ["node", "dist/index.cjs"]
