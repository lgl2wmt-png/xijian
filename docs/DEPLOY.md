# 部署指南

## Docker（全栈，推荐自托管）

```bash
docker compose up -d --build
```

访问 `http://localhost:8787`（前端静态资源 + API + WebSocket 同端口）。

数据目录通过 volume `xijian-data` 持久化 SQLite。

## PWA 静态站 → Vercel（iPhone「添加到主屏幕」）

前端已用 `vite-plugin-pwa` 生成 manifest + Service Worker。Vercel 提供 HTTPS，Safari 才能「添加到主屏幕」。

### 1. 生成静态文件（本地）

```bash
# 不要把局域网 IP 打进公网包：部署构建时清空或改用公网 API
# PowerShell:
$env:VITE_API_BASE=""
npm run build
```

产物在 `dist/`（含 `manifest.webmanifest`、`sw.js`）。

### 2. 部署到 Vercel

**方式 A · 网页（最简单）**

1. 打开 [vercel.com](https://vercel.com) → Import GitHub 仓库 `xijian`
2. Framework 选 Vite（或自动识别 `vercel.json`）
3. Environment Variables（可选）：
   - `VITE_API_BASE` = 你的公网 API 根地址（如 `https://api.example.com`）
   - 若暂时没有公网 API，可留空；首页英雄区仍可用，依赖 `/api` 的列表会失败，直到你接上后端
4. Deploy

**方式 B · CLI**

```bash
npx vercel login
npx vercel          # 预览
npx vercel --prod   # 生产
```

### 3. iPhone 安装成「App」

1. 用 **Safari** 打开你的 Vercel 域名（必须 HTTPS）
2. 点底部分享 → **添加到主屏幕**
3. 桌面出现「栖见」图标；点开为全屏、无地址栏（`display: standalone`）

> Android：Chrome 菜单 → 「安装应用」或「添加到主屏幕」。

### API / Mock 说明

**默认前端走 Mock**（`VITE_USE_MOCK` 未设为 `false`）：案例、设计师、进度、星图等均在浏览器内返回假数据，**不需要** localtunnel / 公网 API，Vercel 单独部署即可完整浏览。

接真实后端时：

1. 环境变量 `VITE_USE_MOCK=false`
2. 设置 `VITE_API_BASE` 为公网 API（Express + SQLite 不适合跑在 Vercel Serverless）

| 前端 | 数据 |
|------|------|
| Vercel 默认 | 前端 Mock |
| Vercel + 自建 API | `VITE_USE_MOCK=false` + `VITE_API_BASE` |
| Docker 一体 | Express 托管 `dist` + 真实 SQLite |

## 仅前端本地预览

```bash
npm run build
npm run preview
```

`preview` 不含后端，需另开 `npm run dev:api`，或使用 Docker。

## 云平台速查

| 场景 | 平台 |
|------|------|
| 全栈 Docker | Railway / Render / 任意 VPS |
| PWA 静态前端 | **Vercel** / Netlify |
| 原生壳 | Capacitor（见 [MOBILE.md](./MOBILE.md)） |

生产环境请设置 `PORT`，并限制 CORS 来源；切勿把真实密钥提交进仓库。
