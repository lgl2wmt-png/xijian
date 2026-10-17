# 发布到 GitHub（Public）

本机已完成：`git init`、首个提交、开源文档与 Docker。按下面步骤推成公开仓库并打 Release。

## 1. 安装 GitHub CLI（若尚未安装）

```powershell
winget install --id GitHub.cli -e
```

重启终端后：

```powershell
gh auth login
```

按提示选 GitHub.com → HTTPS → 浏览器登录。

## 2. 创建公开仓库并推送

在项目根目录 `开源` 下：

```powershell
$env:Path = "C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:Path

# 若还没有 tag：
git tag -a v0.4.0 -m "栖见 v0.4.0"

gh repo create xijian --public --source=. --remote=origin --push
gh release create v0.4.0 --title "栖见 v0.4.0" --notes-file RELEASE_NOTES.md
```

仓库名可改成你喜欢的（如 `xijian-home`）。

## 3. 验证

打开 GitHub 仓库页，确认：

- [ ] README / LICENSE / CONTRIBUTING 可见  
- [ ] Releases 有 `v0.4.0`  
- [ ] 无 `.env`、无 `*.sqlite`  

## 备选：仅用网页

1. 在 github.com 新建 **Public** 空仓库（不要勾选自动加 README）  
2. 本地：

```powershell
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
git push origin v0.4.0
```

3. 在网页 Releases → Draft a new release → 选 tag `v0.4.0`，粘贴 `RELEASE_NOTES.md` 内容。
