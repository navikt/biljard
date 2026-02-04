FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 astro && \
    mkdir -p /app/data && chown astro:nodejs /app/data

USER astro

EXPOSE 8080

CMD ["node", "./dist/server/entry.mjs"]
