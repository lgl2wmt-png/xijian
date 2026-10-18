# 栖见 v0.5.0 Release Notes

性能与移动端里程碑：更小的首屏包体、WebP 资源、小屏可折叠的沉浸式界面。

## Highlights

- **包体**：ECharts 按需加载 + chunk 拆分；HUD 独立懒加载，首屏不再背负图表库
- **移动端**：汉堡导航；星图 / HUD / 沙盘面板可折叠，小屏默认收起次要信息
- **WebP**：Unsplash 与文档截图全面 WebP（首页截图约 1.6MB → ~100KB）
- **工程**：GitHub Actions CI、Playwright 截图脚本、部署文档

## Upgrade from 0.4.0

```bash
git pull
npm install
npm run build
# 或
docker compose up --build
```

本地开发：

```bash
npm run dev
```

重新生成截图：

```bash
npm run screenshots
```

## License

MIT — 详见 [LICENSE](./LICENSE)
