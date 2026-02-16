FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --build-from-source && npm cache clean --force

COPY . .
RUN npm run build

# for sqlite
RUN mkdir -p /app/data

FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/dist /app/dist
COPY --from=builder --chown=nonroot:nonroot /app/node_modules /app/node_modules
COPY --from=builder --chown=nonroot:nonroot /app/package.json /app/package.json
COPY --from=builder --chown=nonroot:nonroot /app/data /app/data

USER nonroot

EXPOSE 8080

CMD ["node", "./dist/server/entry.mjs"]