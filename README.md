# 栖见 · Xijian

按**用户旅程**组织的开源家装平台（React 前端 + Express/SQLite 后端 + 智慧工地 HUD）。

| 页面 | 解决的焦虑 |
|------|------------|
| 首页 | 不知道从哪开始 |
| 案例 | 不知道能不能实现 |
| 找服务 | 不知道选谁 |
| 我的（进度） | 不知道做得怎么样 |
| `/hud` | 全局态势 + 微观指标的「上帝视角」监理 |
| `/sandbox` | 像素沙盘：阶段映射、通关勋章、模拟经营感 |
| `/galaxy` | 决策星图：预算引力场、约束连线、AI 平替 |

## 快速开始

```bash
npm install
npm run dev
```

- 前端：http://localhost:5173（Vite 代理 `/api` 与 `/ws`）
- API：http://localhost:8787
- 智慧工地：http://localhost:5173/hud
- 像素沙盘：http://localhost:5173/sandbox
- 决策星图：http://localhost:5173/galaxy

单独启动：

```bash
npm run dev:api   # Express + SQLite + WebSocket
npm run dev:web   # Vite
npm run seed      # 清空后可删 server/data/*.sqlite 再 seed
```

```bash
npm run build
npm run preview   # 或生产：构建后由 API 托管 dist
```

### Docker

```bash
docker compose up --build
# http://localhost:8787  （静态站 + API + WS 同端口）
```

### 开源协作文件

| 文件 | 用途 |
|------|------|
| [LICENSE](./LICENSE) | MIT |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 如何提 PR |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | 行为准则 |
| [SECURITY.md](./SECURITY.md) | 漏洞报告 |
| [RELEASE_NOTES.md](./RELEASE_NOTES.md) | v0.4.0 说明 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本历史 |

## 架构

```
浏览器 ──► Vite (:5173) ──proxy──► Express (:8787)
                                      │
                                      ├─ SQLite (server/data/xijian.sqlite)
                                      └─ WebSocket /ws?project=p1  实时施工日志
```

### 主要 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cases` | 案例列表 |
| GET | `/api/designers` | 设计师筛选 |
| POST | `/api/bookings` | 预约入库 |
| POST | `/api/quotes` | 报价入库 |
| GET | `/api/projects/mine` | 我的工程 + 时间轴 |
| POST | `/api/projects/:id/stages/:sid/accept` | 验收 |
| GET | `/api/projects/:id/hud` | HUD 聚合数据 |
| GET | `/api/galaxy` | 决策星图节点/边/平替 |
| POST | `/api/galaxy/ask` | 自然语言高亮节点 |
| WS | `/ws?project=p1` | 实时日志推送 |

## 技术栈

- 前端：Vite · React 19 · TypeScript · Tailwind 4 · ECharts · React Router
- 后端：Express 5 · better-sqlite3 · ws
- 许可：[MIT](./LICENSE)

## 参与贡献

见 [CONTRIBUTING.md](./CONTRIBUTING.md)。
