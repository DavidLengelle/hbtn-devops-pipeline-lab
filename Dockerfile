# Multi-stage build for the pipeline lab API.
#
#   builder : the whole dependency tree, development packages included, plus the
#             sources and the tests. docker-compose targets this stage, which is
#             how `docker compose run --rm app npm test` finds jest, supertest
#             and eslint without anything being installed on your machine.
#   runtime : production dependencies only, no build tooling, non-root user.
#             This is the image the pipeline builds and pushes.

# ---------- builder -------------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Dependency manifests first: this layer survives every source-only change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# ---------- runtime -------------------------------------------------------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app
USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O - http://127.0.0.1:3000/health || exit 1

CMD ["node", "src/server.js"]
