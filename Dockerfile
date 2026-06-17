FROM node:26-bullseye-slim AS deps
WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

FROM deps AS builder
WORKDIR /app

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build && chown -R node:node /app

FROM node:26-bullseye-slim AS runner
WORKDIR /app

COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
