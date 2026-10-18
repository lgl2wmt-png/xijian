# 自动成片输出

## 成片（可直接发抖音试看）

| 文件 | 说明 |
|------|------|
| **`xijian-promo-25s.mp4`** | 竖屏 1080×1920，约 25–30s，五镜字幕卡点拼接 |
| `xijian-promo-raw.webm` | Playwright 连续录屏原片（可再精剪） |
| `frames/*.png` | 各镜静帧，拖进剪映替换/加特效 |

## 重新生成

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# 另开终端：
npm run promo:video
```

需要本机 `tools/ffmpeg/bin/ffmpeg.exe`（或系统 PATH 中的 ffmpeg）。

## 精剪建议

1. 成片加赛博 BGM，卡点 0 / 3 / 8 / 13 / 20 秒  
2. 用真机「添加到主屏幕」替换第 4 镜  
3. Cursor Agent 真录屏替换第 2 镜（打码 Token）
