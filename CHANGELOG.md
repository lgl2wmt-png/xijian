# Changelog

## [Unreleased]

## [0.5.0] — 2026-10-18

### 新增

- GitHub Actions CI（lint / build / API smoke / Docker build）
- README 徽章与部署文档 `docs/DEPLOY.md`
- Playwright 自动截图：`npm run screenshots` → `docs/screenshots/*.webp`
- README 挂载核心页面截图（WebP）

### 优化

- ECharts 按需注册 + `manualChunks`（`echarts` / `react-vendor`）；HUD 懒加载，首屏不再背负图表库
- 移动端折叠：汉堡导航；星图时间轴/AI 面板；HUD 指标与台账；沙盘指标卡默认收起
- 图片 WebP：Unsplash `fm=webp`；文档截图全面 WebP（首页截图约 1661KB → 100KB）

## [0.4.0] — 2026-10-18

### 新增

- 决策星图 `/galaxy`：力导向引力场、房间/品类节点、约束/冲突连线、左侧时间轴、右侧 AI 面板、底部自然语言提问
- 一键平替（大理石电视墙 → 岩板）与工序联动说明（智能马桶 ↔ 插座等）
- `GET /api/galaxy`、`POST /api/galaxy/ask`

## [0.3.0] — 2026-10-18

### 新增

- 像素数字孪生沙盘 `/sandbox`：2.5D 剖面随工序变貌、分区气泡、8 格指标矩阵、通关勋章、隐蔽工程配方终端
- HUD / 进度页互链沙盘；HUD 与沙盘 React.lazy 按需加载，减小首屏包体

## [0.2.0] — 2026-10-18

### 新增

- Express + SQLite 真实后端（案例/设计师/预约/报价/工程）
- WebSocket 实时施工日志
- 智慧工地 HUD：顶部状态栏、户型施工区、六大仪表盘（日志/资金/雷达/材料/健康度/完工环）
- Vite 代理 `/api`、`/ws`；`npm run dev` 同时起前后端

### 变更

- 前端全面改为 `fetch` API，移除静态 mock 数据源

## [0.1.0] — 2026-10-18

### 新增

- 用户旅程四大模块：首页、案例、找服务、我的（施工进度）
- 案例详情：结构化造价信息、Before/After 对比、底部常驻 CTA
- 设计师筛选：户型 / 风格 / 预算；极简预约表单
- 进度时间轴：状态色、现场图、节点验收
- 开源基础：MIT LICENSE、README、CONTRIBUTING

### 已知限制

- 数据为前端 Mock，无真实后端 / AI 诊断（已在后续版本解决）
