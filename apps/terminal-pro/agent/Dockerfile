# Multi-stage, non-root, healthcheck via compose
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-slim AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-slim
ENV NODE_ENV=production PORT=3333
WORKDIR /app
RUN addgroup --system nodegrp && adduser --system --ingroup nodegrp nodeusr
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER nodeusr
EXPOSE 3333
CMD ["node", "dist/server.js"]
