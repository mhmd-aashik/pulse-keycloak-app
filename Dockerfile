# Stage 1: Build
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Runtime
FROM oven/bun:1-alpine AS runner
WORKDIR /app

COPY package.json bun.lock ./
ENV HUSKY=0
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

ENV NODE_PATH=/app/dist
EXPOSE 3000
CMD ["bun", "dist/src/main.js"]