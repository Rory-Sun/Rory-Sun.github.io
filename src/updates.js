// 观测日志：主页与三件作品的更新记录，新的在前。
// 每一条都要能在对应仓库的提交历史里找到依据（日期按北京时间）。只记访客能感知到的变化，
// 不记依赖升级、构建配置这类内部改动。
//
// 字段说明：
//   date    YYYY-MM-DD（北京时间）
//   target  作品 id（见 products.js），或 'site' 表示主页本身
//   title   一句话标题
//   text    一两句说明：变了什么，访客能看到什么
//   url     可选：直达链接
export const UPDATES = [
  {
    date: '2026-10-11',
    target: 'site',
    title: '中英双语',
    text: '主页有了英文版，地址是 /en/，导航栏的「EN / 中」可以随时切换，并保留当前选中的作品；英文版有自己的分享卡片和订阅源。',
    en: { title: 'English edition', text: 'The homepage now has an English edition at /en/. The EN / 中 switch in the top bar flips between languages and keeps the work you had selected; the English edition has its own share card and feed.', url: 'https://rory-sun.github.io/en/' },
  },
  {
    date: '2026-10-11',
    target: 'site',
    title: '作品技术拆解',
    text: '在任务索引里选中一件作品，下方会列出它的关键数字和四个技术决策，每个都写明难点、做法与取舍。',
    en: { title: 'Technical breakdowns', text: 'Select a work in the mission index and its key numbers and four technical decisions appear below, each with the problem, the approach and the trade-off.' },
  },
  {
    date: '2026-10-11',
    target: 'site',
    title: '观测日志与订阅源',
    text: '新增这份更新记录，可以按作品筛选；同一份数据生成 Atom 订阅源，可以用 RSS 阅读器订阅。',
    url: 'https://rory-sun.github.io/feed.xml',
    en: { title: 'Observation log and feed', text: 'This update log, filterable by work; the same data generates an Atom feed you can follow in any feed reader.', url: 'https://rory-sun.github.io/en/feed.xml' },
  },
  {
    date: '2026-10-11',
    target: 'site',
    title: '主页改版为「观测台」',
    text: '三张作品大卡片换成一张任务索引，选中哪件就在画面里看哪件；新增操作员档案与制作管线，首屏地球外加了一圈观测准星。',
    en: { title: 'Homepage redesigned as an observatory console', text: 'Three large work cards became one mission index: pick a work and it appears in the screen. An operator file and a production pipeline were added, and the globe now sits inside an observation reticle.' },
  },
  {
    date: '2026-09-17',
    target: 'site',
    title: '「人体 · 一日」加入主页',
    text: '作为第二件作品放在地球纪元之后：行星的 46 亿年、身体的一天、村庄的一个下午，尺度层层收缩。',
    en: { title: '“A Day in the Body” joins the homepage', text: 'Placed second, after Earth Chronicle: a planet’s 4.6 billion years, a body’s day, a village’s afternoon, the scale contracting as you go.' },
  },
  {
    date: '2026-09-17',
    target: 'site',
    title: '无障碍与排版修复',
    text: '主按钮对比度提到 5.5:1 以上，补上键盘焦点与跳转链接，平板宽度单独设计，中文标题不再在词中间断行。',
    en: { title: 'Accessibility and typography fixes', text: 'Primary buttons now clear 5.5:1 contrast, keyboard focus styles and a skip link were added, tablet widths got their own layout, and Chinese headlines no longer break mid-word.' },
  },
  {
    date: '2026-09-15',
    target: 'human-atlas',
    title: '部件搜索',
    text: '可以用「肾」「股骨」这样的中文关键词或英文原名搜索 2331 个解剖部件，点中后按需下载、定位并高亮。',
    url: 'https://rory-sun.github.io/blender-designer/anatomy/',
    en: { title: 'Part search', text: 'Search the 2,331 anatomical parts by original name or by common Chinese keywords such as 肾 (kidney) or 股骨 (femur); pick a result and it downloads, frames and highlights on demand.' },
  },
  {
    date: '2026-09-14',
    target: 'human-atlas',
    title: '展开解剖部件',
    text: '一次点击把整个人平滑展开成解剖爆炸图，可以停在任意展开程度，再点一次重新组合归位。',
    url: 'https://rory-sun.github.io/blender-designer/anatomy/',
    en: { title: 'Exploded view', text: 'One click smoothly explodes the whole body into its anatomical parts; stop at any point, and click again to reassemble.' },
  },
  {
    date: '2026-09-11',
    target: 'human-atlas',
    title: '首版上线',
    text: '用 Z-Anatomy 的真实解剖网格构建的交互解剖实验室原型，人体不是用球体和胶囊拼出来的近似。',
    url: 'https://rory-sun.github.io/blender-designer/anatomy/',
    en: { title: 'First release', text: 'A prototype interactive anatomy lab built from Z-Anatomy’s real meshes, not an approximation made of spheres and capsules.' },
  },
  {
    date: '2026-09-11',
    target: 'autumn-creek',
    title: '更丰富的山野',
    text: '加入 Poly Haven 的 CC0 蕨类、草丛与苔石，溪岸和田埂更有生气；小狗停下来时也会有闲置动作。',
    url: 'https://rory-sun.github.io/blender-designer/?v=3d-final',
    en: { title: 'A richer countryside', text: 'Poly Haven CC0 ferns, grasses and mossy stones bring the creek banks and field edges to life, and the dog now idles when it stops.' },
  },
  {
    date: '2026-09-09',
    target: 'earth-chronicle',
    title: '生命之树模式',
    text: '约 90 个谱系的演化树与地球共用一条时间轴，同日改为径向年代图：半径即时间，拖动时间轴，谱系随之生长。',
    url: 'https://rory-sun.github.io/earth-chronicle/?mode=life',
    en: { title: 'Tree of Life mode', text: 'An evolutionary tree of about 90 lineages that shares Earth’s timeline; the same day it became a radial chronogram, with radius as time and lineages growing as you drag.' },
  },
  {
    date: '2026-09-09',
    target: 'earth-chronicle',
    title: '月球模式',
    text: '在同一条时间轴下环绕月球：岩浆洋、晚期重轰击的陨坑累积、月海喷发，直到着陆点一一亮起。',
    url: 'https://rory-sun.github.io/earth-chronicle/?mode=moon',
    en: { title: 'Moon mode', text: 'Orbit the Moon on the same timeline: the magma ocean, craters piling up through the Late Heavy Bombardment, mare eruptions, and finally the landing sites lighting up.' },
  },
  {
    date: '2026-09-09',
    target: 'site',
    title: '个人主页上线',
    text: '首屏是一颗实时渲染的三维地球，可以拖动旋转；支持深浅两种主题。',
    en: { title: 'Homepage launched', text: 'Opens on a real-time 3D Earth you can drag to rotate, with light and dark themes.' },
  },
  {
    date: '2026-09-09',
    target: 'autumn-creek',
    title: '公开上线',
    text: '溪畔秋日部署到公网，可以在主页里直接试玩；同日给小狗换上了自然的小跑步态。',
    url: 'https://rory-sun.github.io/blender-designer/?v=3d-final',
    en: { title: 'Public release', text: 'Autumn by the Creek went live and became playable on the homepage; the same day the dog got a natural trot.' },
  },
  {
    date: '2026-09-09',
    target: 'earth-chronicle',
    title: 'NASA 卫星影像与真实地月距离',
    text: '现代地球改用 NASA Blue Marble 与 Black Marble 影像；地月按真实的 60.3 个地球半径摆放；新增资料来源与科学说明页。',
    url: 'https://rory-sun.github.io/earth-chronicle/sources/',
    en: { title: 'NASA imagery and the true Earth–Moon distance', text: 'The present-day Earth switched to NASA Blue Marble and Black Marble imagery, the Moon now sits at its true distance of 60.3 Earth radii, and a sources and science notes page was added.' },
  },
  {
    date: '2026-09-09',
    target: 'earth-chronicle',
    title: '导览模式与物理大气',
    text: '21 章镜头导览带你走完 46 亿年；大气改为光线步进的瑞利与米氏单次散射。',
    url: 'https://rory-sun.github.io/earth-chronicle/',
    en: { title: 'Guided tour and a physical atmosphere', text: 'A 21-chapter guided tour walks you through 4.6 billion years, and the atmosphere switched to ray-marched Rayleigh and Mie single scattering.' },
  },
  {
    date: '2026-09-08',
    target: 'autumn-creek',
    title: '首版完成',
    text: '一座可以自由环绕、点击探索的三维山村：溪流、石桥、稻田、瓦屋与一只小狗，场景与生成脚本都保留在 Blender 里。',
    en: { title: 'First version', text: 'A 3D mountain village you can orbit and click to explore (creek, stone bridge, rice fields, tiled houses and a dog), with the scene and its generator scripts kept in Blender.' },
  },
  {
    date: '2026-09-08',
    target: 'earth-chronicle',
    title: '首版完成',
    text: 'Blender 烘焙贴图加 Three.js 实时渲染的三维地球，用一条可以拖动的时间轴回放地球的演化史。',
    en: { title: 'First version', text: 'A 3D Earth with Blender-baked textures and Three.js real-time rendering, replaying the planet’s history along a timeline you can drag.' },
  },
];
