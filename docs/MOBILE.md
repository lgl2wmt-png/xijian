# 栖见 · 移动端（Capacitor + PWA）

## API 地址（App 必读）

手机里的 WebView **不能**用 `localhost:8787` 访问你电脑上的后端。

打包前设置环境变量（复制 `.env.example` → `.env`）：

```bash
# 局域网调试：电脑 IP + API 端口
VITE_API_BASE=http://192.168.1.8:8787

# 上线：公网 HTTPS
VITE_API_BASE=https://your-domain.com
```

然后：

```bash
npm run cap:sync
```

同源 Web / Docker 部署可留空 `VITE_API_BASE`，前端继续走相对路径 `/api`。

Android 已开启 `usesCleartextTraffic`，允许 HTTP 局域网 API；正式环境请用 HTTPS。

## Capacitor → Debug APK（Android）

1. 安装 [Android Studio](https://developer.android.com/studio)（本机需 JDK）。
2. `npm run cap:open` 或用 Android Studio 打开仓库里的 `android/`。
3. 等待 Gradle 同步 → **Build → Build Bundle(s) / APK(s) → Build APK(s)**。
4. 产物：`android/app/build/outputs/apk/debug/app-debug.apk`。

日常改前端后同步：

```bash
npm run cap:sync
```

Debug APK 仅供自测；上架需 Release 签名、各应用商店账号与软著等流程。

## Capacitor → iOS（需 macOS + Xcode）

仓库已包含 `ios/`（Windows 上可 `cap add ios` 生成，**编译/真机安装必须在 Mac 上**）：

```bash
npm install
npm run cap:sync
npx cap open ios   # 或 npm run cap:open:ios
```

在 Xcode 中选中真机 → Run。免费 Apple ID 签名的 App 约 7 天过期；上架 App Store 需付费开发者账号。

无 Mac 时可考虑 [Codemagic](https://codemagic.io) 等云端 Mac 构建，或直接用下方 PWA。

## PWA（无需 Android Studio / Xcode）

`vite-plugin-pwa` 已接入：`manifest` + Service Worker。推荐部署到 **Vercel**（HTTPS）：

```bash
npm run build
npx vercel --prod
# 或网页 Import GitHub，详见 docs/DEPLOY.md
```

**iPhone：** Safari 打开站点 → 分享 → **添加到主屏幕** → 全屏无地址栏。  
**Android：** Chrome → 安装应用 / 添加到主屏幕。

## 安全区

`viewport-fit=cover` + `env(safe-area-inset-*)` 已加在全局 CSS / 页脚，避免刘海与底部手势条遮挡。
