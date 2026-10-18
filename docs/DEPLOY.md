# 部署指南

## Docker（推荐）

```bash
docker compose up -d --build
```

访问 `http://localhost:8787`（前端静态资源 + API + WebSocket 同端口）。

数据目录通过 volume `xijian-data` 持久化 SQLite。

## 仅前端预览

```bash
npm run build
npm run preview
```

注意：`preview` 不包含后端，需另开 `npm run dev:api`，或使用 Docker 一体部署。

## 云平台建议

| 场景 | 平台 |
|------|------|
| 全栈 Docker | Railway / Render / 任意 VPS |
| 纯静态前端 | Vercel / Netlify（需自行配置 API 代理） |
| 自有服务器 | `docker compose up -d` + Nginx 反代 |

生产环境请设置 `PORT`，并限制 CORS 来源；切勿把真实密钥提交进仓库。
