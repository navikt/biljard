FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --build-from-source && npm cache clean --force

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