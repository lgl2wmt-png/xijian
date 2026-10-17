# 栖见单容器：构建前端后由 Express 托管静态资源 + API + WS
FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8787
EXPOSE 8787

CMD ["npx", "tsx", "server/index.ts"]
