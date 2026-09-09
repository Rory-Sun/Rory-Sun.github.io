# Rory · 个人主页

线上地址：https://rory-sun.github.io/

数据驱动的作品展示页（`src/products.js` 每条记录生成一个产品区块，同时生成页面里的 JSON-LD 结构化数据）。产品本体各自独立部署：

- 地球纪元 · Earth Chronicle → 仓库 `Rory-Sun/earth-chronicle`，https://rory-sun.github.io/earth-chronicle/
- 溪畔秋日 → 仓库 `Rory-Sun/blender-designer`，https://rory-sun.github.io/blender-designer/

## 开发

```bash
npm install
npm run dev          # 本地开发，http://127.0.0.1:5174
npm run check        # 推送前跑一次：校验产品数据 → ESLint → 生产构建
```

单独的命令：`npm run validate`（只校验 `src/products.js`）、`npm run lint`、`npm run build`、`npm run preview`。

`npm run screenshots` 用 Playwright 对 `dist/` 在桌面、平板、手机三种宽度、深浅两种主题下各截一张整页图，输出到 `screenshots/`。本地首次使用前需要 `npx playwright install chromium`。

## 新增一个作品

在 `src/products.js` 里加一条记录即可，字段说明见文件头部注释。构建时会校验：`id` 必须是唯一的小写短横线 slug，`status` 只能是 `live` 或 `soon`，`live` 的作品必须有 `url`，本地 `poster` 路径必须真实存在于 `public/`，拼错的字段名会被指出。校验失败时 `npm run build` 直接报错，部署不会进行。

## 持续集成

- **Deploy**（`.github/workflows/deploy.yml`）：推送到 `main` 后运行 `npm run check` 并发布到 GitHub Pages。
- **Quality**（`.github/workflows/quality.yml`）：推送和 PR 都会触发，不阻塞部署。
  - Lighthouse：对构建产物打分，阈值在 `lighthouserc.json`（可访问性、最佳实践、SEO 低于门槛即失败，性能只警告）；报告链接在 job 日志里。
  - Screenshots：六张整页截图作为构建产物上传，在 Actions 运行页的 Artifacts 面板下载。

## 分享卡片

`public/site/og.jpg`（1200×630）是社交平台抓取的预览图。改标语后需要重新生成这张图。
