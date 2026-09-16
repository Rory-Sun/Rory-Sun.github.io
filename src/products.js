// 产品数据：新增一个项目只需在这里加一条记录，页面会自动生成展示区块。
// 字段说明：
//   id        锚点 id（可用 #id 直达）
//   kicker    小标题（分类/系列）
//   title / subtitle / desc
//   tags      标签数组
//   poster    海报图路径（可为空：将显示以 accent 为主色的占位海报）
//   accent    占位海报与高光颜色
//   url       完整版链接（新标签页打开）
//   embed     可选：页内嵌入地址（为空则不提供“页内演示”按钮）
//   demoNote  可选：演示按钮下方的一行说明（覆盖默认文案）
//   features  亮点列表 [{ icon, title, text }]
//   status    'live' | 'soon'（soon 显示为小卡片）
//
// 展示顺序即叙事顺序：行星的 46 亿年 → 身体的一天 → 村庄的一个下午，尺度层层收缩。
export const PRODUCTS = [
  {
    id: 'earth-chronicle',
    kicker: '交互式三维地球',
    title: '地球纪元 · Earth Chronicle',
    subtitle: '46 亿年的行星演化 · 30 万年的人类迁徙',
    desc: '一个完全离线的交互式三维地球平台：拖动旋转，拖动时间轴，看大陆漂移、雪球地球、恐龙灭绝，直到人类的灯光点亮夜空。现代地球使用 NASA Blue Marble 与 Black Marble 卫星影像，远古时代的地形、云层与夜灯由 Blender 程序化生成并烘焙。',
    tags: ['三维交互', '时间轴叙事', 'Blender 烘焙', '零 API', '离线运行'],
    poster: '/site/earth_preview_1200.webp',
    accent: '#3d8ee6',
    url: 'https://rory-sun.github.io/earth-chronicle/',
    embed: 'https://rory-sun.github.io/earth-chronicle/?embed=1',
    features: [
      { icon: '🌍', title: '地球演化', text: '冥古宙岩浆海、大氧化事件、两次雪球地球、盘古大陆聚合与裂解、白垩纪高海平面、希克苏鲁伯撞击、第四纪冰期——全部由时间轴驱动，并附古地理小地图。' },
      { icon: '🧭', title: '人类迁徙', text: '30 万年间 50 余条迁徙路线逐步绘出，40 个考古遗址随时间点亮，人口、海平面与冰盖边缘实时统计。' },
      { icon: '✨', title: '逼真地球', text: '4K/8K 程序化地形、法线与生物群系贴图，大气散射、云影、海面高光与城市夜灯；月球同样在 Blender 中程序化建模。' },
    ],
    status: 'live',
  },
  {
    id: 'human-atlas',
    kicker: '交互式三维人体',
    title: '人体 · 一日',
    subtitle: 'A day in the body',
    desc: '2331 个真实解剖部件在浏览器里重新组装成一个人。网格来自 Z-Anatomy 与 BodyParts3D 的开放医学数据，在 Blender 里整理、着色、导出，不是用球体和胶囊拼出来的近似。拖动一天的时间轴，看心脏、肺与消化如何随睡眠、进食和运动改变；七个系统各自可以显隐，外壳可以透明，整个人可以展开成一张解剖爆炸图。',
    tags: ['真实解剖数据', '2331 个部件', '系统显隐', '一天时间轴', 'Blender 导出'],
    poster: '/site/human_atlas_1200.webp',
    accent: '#c98f4e',
    emoji: '🫀',
    url: 'https://rory-sun.github.io/blender-designer/anatomy/',
    // no embed: the model alone is 28MB, and the three-column lab UI needs far more room
    // than the 16:9 demo frame gives it
    demoNote: '解剖模型约 28MB · 建议在新标签页全屏体验',
    features: [
      { icon: '🫀', title: '真实的身体', text: '解剖网格来自 Z-Anatomy 与 BodyParts3D 的开放医学数据，在 Blender 中整理导出；骨骼、肺与肌肉使用随视角变化的透视材质，叠起来是 X 光轮廓而不是白雾。' },
      { icon: '🕘', title: '身体的一天', text: '拖动时间轴走完 24 小时，睡眠、进食、日常与运动四种状态驱动心率与呼吸；器官节律与时间快进是两套独立的控制。' },
      { icon: '🔍', title: '展开到部件', text: '一次点击把整个人展开成 2331 个独立命名的部件，可以停在任意展开程度，也可以搜索「肾」「股骨」或英文原名定位并高亮。' },
    ],
    status: 'live',
  },
  {
    id: 'autumn-creek',
    kicker: '交互式三维风景',
    title: '溪畔秋日',
    subtitle: 'A place to slow down',
    desc: '走进溪畔秋日。自由环绕一座三维山村，点击石桥、稻田与小狗，听见溪水与鸟鸣——一个为放慢节奏而做的沉浸式场景。',
    tags: ['三维场景', '环境音效', '点击互动', '氛围叙事'],
    poster: '/site/autumn_creek_1200.webp',   // self-hosted 1200px copy of blender-designer/preview-desktop.png
    accent: '#3f7a4a',
    emoji: '🍂',
    url: 'https://rory-sun.github.io/blender-designer/?v=3d-final',
    embed: 'https://rory-sun.github.io/blender-designer/?v=3d-final',
    features: [
      { icon: '🏞️', title: '自由环绕', text: '拖动镜头在山村间环绕，秋色随视角变化，溪水在脚下流过。' },
      { icon: '🐕', title: '可点击的世界', text: '石桥、稻田与小狗都能触发互动与声音，细节里藏着惊喜。' },
      { icon: '🎧', title: '声音景观', text: '溪水与鸟鸣随位置变化，营造缓慢、安静的沉浸感。' },
    ],
    status: 'live',
  },
  {
    id: 'moon-mode',
    kicker: '地球纪元 · 新视角',
    title: '月球',
    desc: '同一条时间轴下的月球史：忒伊亚大碰撞、岩浆洋、晚期重轰击、月海喷发、逐渐远离地球，直到阿波罗与嫦娥的着陆点一一亮起。作为地球纪元的第四个模式上线。',
    emoji: '🌙',
    accent: '#7a86a8',
    url: 'https://rory-sun.github.io/earth-chronicle/?mode=moon',
    status: 'soon',
  },
  {
    id: 'tree-of-life',
    kicker: '地球纪元 · 新视角',
    title: '生命之树',
    desc: '一棵可缩放的演化树，与地球纪元共用一条时间轴：拖动时间，谱系随之生长；灭绝的支系停在原地标上 †；点击任一物种查看简介并跳到它的起源时刻。约 90 个谱系，从最后共同祖先到智人。',
    emoji: '🧬',
    accent: '#8a5aa8',
    url: 'https://rory-sun.github.io/earth-chronicle/?mode=life',
    status: 'soon',
  },
];
