# Rory · 个人主页

线上地址：https://rory-sun.github.io/

页面是一台「观测台」控制台：细网格、带角标的线框、屏幕两侧的遥测读数、等宽字体的数据层。六个区块依次是 01 观测（准星里的实时地球）、02 任务索引、03 操作员档案、04 制作管线、05 观测日志、06 联络。

## 中英双语

站点有两个网址：中文 `/` 和英文 `/en/`，互相用 hreflang 标注，导航栏的「EN / 中」在两者之间切换，并保留当前选中的作品。

- `index.html` 是两种语言共用的模板，文字写成双花括号标记，内容在 `src/i18n.js` 的 `STRINGS` 里。`en/index.html` 只是英文页的入口占位，构建时被模板替换。改文字去 `src/i18n.js`，不要改模板。
- 作品和日志的英文写在每条记录的 `en` 字段里（`products.js` 的 `en: { title, desc, specs, features, breakdown… }`，`updates.js` 的 `en: { title, text }`）。
- 构建会校验：两种语言的界面文字键完全一致；模板里的每个标记都有定义；中文页显示的每个作品字段都有英文，且列表长度、结构一致；每条日志都有英文。漏译一处，构建就失败。
- 英文页有自己的分享图 `og-en.jpg`、订阅源 `/en/feed.xml` 和结构化数据；站点地图同时列出两个网址。
- 英文标题按单词换行，可以用 `text-wrap: balance`；中文标题绝对不能用，见设计复审清单。
- 英文页导航标签更长，折叠成菜单的宽度是 920px（中文页 800px），`src/nav.js` 与 `src/site.css` 里要同步。

## 技术拆解

每件在线作品可以在 `products.js` 里带一个 `breakdown`：1–4 个关键数字（`metrics`）、若干技术决策（`decisions`，每条写明 `problem` 难点 / `approach` 做法 / `tradeoff` 取舍），以及可选的 `boundary` 内容边界说明。在任务索引里选中作品后，它显示在画面与档案下方。

写拆解的规矩：每个数字和做法都要能在作品仓库的代码、注释或文档里找到出处（出处写在记录上方的注释里）；取舍要如实写局限，不要只写好的一面。

## 观测日志

`src/updates.js` 是主页与三件作品的更新记录，新的在前。每一条都要能在对应仓库的提交历史里找到依据，日期按北京时间；只记访客能感知到的变化。构建时会校验日期真实、顺序正确、`target` 指向存在的作品或 `'site'`。

同一份数据还会在构建时生成 Atom 订阅源 `/feed.xml`，以及站点地图里的最后修改日期，所以加一条日志就同时更新了这三处。

数据驱动：`src/products.js` 每条记录生成任务索引里的一行、选中后的画面与档案、制作管线矩阵的一行，以及页面里的 JSON-LD 结构化数据。子模式（如月球、生命之树）用 `parent` 字段挂在所属作品下面。产品本体各自独立部署：

展示顺序即叙事顺序，尺度层层收缩：

- 地球纪元 · Earth Chronicle → 仓库 `Rory-Sun/earth-chronicle`，https://rory-sun.github.io/earth-chronicle/
- 人体 · 一日 → 仓库 `Rory-Sun/blender-designer`，https://rory-sun.github.io/blender-designer/anatomy/
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

在线作品还必须有 `code`（如 `EC-01`）、`scale`、`source`、`size` 四个字段，它们是任务索引的列；`specs` 是档案里的规格表；`stages` 决定制作管线矩阵里的圆点。

字体用 @fontsource 自托管，不要换回 Google Fonts 链接：它在中国大陆基本访问不了。

不是每个作品都适合页内嵌入。资源太重或界面太密的项目留空 `embed`，只给「打开项目」按钮，并用 `demoNote` 写明原因（例如「人体 · 一日」的解剖模型约 28MB）。

## 持续集成

- **Deploy**（`.github/workflows/deploy.yml`）：推送到 `main` 后运行 `npm run check` 并发布到 GitHub Pages。
- **Quality**（`.github/workflows/quality.yml`）：推送和 PR 都会触发，不阻塞部署。
  - Lighthouse：对构建产物打分，阈值在 `lighthouserc.json`（可访问性、最佳实践、SEO 低于门槛即失败，性能只警告）；报告链接在 job 日志里。
  - Screenshots：六张整页截图作为构建产物上传，在 Actions 运行页的 Artifacts 面板下载。

## 设计复审

每两天一次的界面复审流程与检查清单见 [docs/design-review.md](docs/design-review.md)，包含中文排版的硬性规则和待办候选。

## 分享卡片

`public/site/og.jpg`（1200×630）是社交平台抓取的预览图。改标语或增删作品后重新生成：

```bash
python scripts/make-og.py
```

文案与作品标签在该脚本顶部的常量里。
