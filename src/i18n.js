// Interface strings for both languages. The site is built twice from one template: / (Chinese) and
// /en/ (English). index.html holds {{key}} tokens that the build fills from STRINGS; the browser
// scripts look strings up with t(). Product and log content carries its own `en` fields (see
// products.js / updates.js) and is read through loc().
//
// Rules (enforced by scripts/validate-products.mjs):
//   - every key exists in both languages
//   - every {{key}} in index.html exists
//   - values used inside an HTML attribute contain no double quote
// Values may contain markup where the template expects it (h1, lede, tags...).

export const LANGS = ['zh', 'en'];

export const STRINGS = {
  zh: {
    'html.lang': 'zh-CN',
    'meta.title': 'Rory · 创意技术与三维可视化',
    'meta.description': 'Rory，苏州的创意技术从业者，十年经验，接受合作。用 Blender、Three.js 与自写着色器做的三件交互式三维作品：回放 46 亿年的「地球纪元」、由真实解剖数据构建的「人体 · 一日」、可以慢下来的「溪畔秋日」。',
    'og.locale': 'zh_CN',
    'og.localeAlt': 'en_US',
    'og.description': '用 Blender、Three.js 与自写着色器，把地质、解剖与自然的数据做成可以亲手转动的世界。三件作品：地球纪元、人体 · 一日、溪畔秋日。',
    'og.image': 'https://rory-sun.github.io/site/og.jpg',
    'og.imageAlt': 'RORY.studio：创意技术与三维可视化，配一颗三维渲染的地球',
    'tw.description': '用 Blender、Three.js 与自写着色器，把地质、解剖与自然的数据做成可以亲手转动的世界。',
    'url.self': 'https://rory-sun.github.io/',
    'url.feed': '/feed.xml',
    'feed.title': 'RORY.studio · 观测日志',
    'lang.other.href': '/en/',
    'lang.other.code': 'en',
    'lang.other.label': 'EN',
    'lang.other.aria': 'Read this page in English',

    'skip': '跳到作品',
    'nav.aria': '站内导航',
    'nav.obs': '观测', 'nav.works': '作品', 'nav.file': '档案', 'nav.pipe': '管线', 'nav.log': '日志', 'nav.contact': '联络',
    'clock.zone': '苏州 UTC+8',
    'theme.toLight': '切换到浅色模式',
    'theme.toDark': '切换到深色模式',
    'menu.open': '打开菜单',
    'menu.close': '关闭菜单',
    'edge.sector': '区块', 'edge.scroll': '进度', 'edge.vp': '视口', 'edge.targets': '目标',
    'sector.obs': '01 观测', 'sector.works': '02 作品', 'sector.file': '03 档案', 'sector.pipe': '04 管线', 'sector.log': '05 日志', 'sector.contact': '06 联络',

    'hero.ready': '链路就绪', 'hero.city': '苏州', 'hero.targets': '观测目标', 'hero.sync': '最近同步',
    'hero.h1': '<span class="nb">我把复杂的数据与故事，</span><br /><span class="nb">做成可以<em>亲手转动</em>的世界。</span>',
    'hero.lede': '用 Blender、Three.js 与自写着色器，把地质、解剖与自然的数据做成可以亲手转动的世界。目前有<span class="nb">三件作品</span>：<span class="nb">一颗回放 46 亿年的地球</span>、<span class="nb">一具随一天变化的人体</span>、<span class="nb">一座可以慢下来的山村</span>。',
    'hero.cta': '▸ 进入任务索引',
    'hero.cta2': '发送信号',
    'tel.1.v': '46<small>亿年</small>', 'tel.1.l': '可回放的地球历史',
    'tel.2.v': '2331', 'tel.2.l': '真实解剖部件',
    'tel.3.v': '10<small>年</small>', 'tel.3.l': '从业经验',
    'globe.aria': '可拖动旋转的实时三维地球',
    'ro.target': '目标', 'ro.targetName': '地球 · TERRA', 'ro.spin': '自转 θ', 'ro.tilt': '轴倾角', 'ro.fov': '视场', 'ro.terminator': '◐ 晨昏线', 'ro.drag': '拖动旋转',

    'works.h2': '任务索引',
    'works.aria': '作品列表，选择一项在下方查看',
    'ix.code': '编号', 'ix.work': '作品', 'ix.scale': '尺度', 'ix.src': '数据来源', 'ix.size': '规模', 'ix.access': '访问',
    'ov.feed': '画面',

    'file.h2': '操作员档案',
    'file.tag': '在科学与视觉之间做翻译',
    'file.k.alias': '代号', 'file.k.focus': '方向', 'file.k.loc': '所在地', 'file.k.years': '从业', 'file.k.collab': '合作状态', 'file.k.tools': '工具链', 'file.k.channel': '信道',
    'file.v.focus': '创意技术 · 三维可视化 · 程序化生成',
    'file.v.loc': '中国 · 苏州',
    'file.v.years': '<span class="mono-num">10</span> 年',
    'file.v.collab': '接受合作',
    'file.thesis': '怎样让一个人在<span class="nb">三十秒</span>内，理解一件花了<span class="nb">几十亿年</span>才发生的事？答案往往不是更多的文字，而是一个可以被拖动、缩放、倒带的世界。',
    'file.note': '我的工作流横跨三维建模、实时渲染与数据工程：在 Blender 里用节点程序化地生成地形、生物群系与云层，烘焙成贴图；在浏览器里用 Three.js 与 GLSL 还原大气散射、海面高光与昼夜交替；再把地质、解剖与人口数据编成可以播放的时间轴。',
    'file.tags': '<li>实时三维与着色器</li><li>Blender 程序化建模</li><li>数据可视化叙事</li><li>离线优先的 Web 应用</li><li>科普与教育产品</li>',

    'pipe.h2': '制作管线',
    'pipe.tag': '数据 → 烘焙 → 实时 → 叙事',
    'pipe.s1.l': 'S1 · 数据', 'pipe.s1.h': '采集与整理',
    'pipe.s1.p': '把海岸线、地形、解剖网格与考古遗址整理成可烘焙、可索引的结构：Natural Earth 栅格化为 8K 陆地遮罩，解剖模型拆成 2331 个独立命名的部件。',
    'pipe.s2.l': 'S2 · Blender', 'pipe.s2.h': '程序化与烘焙',
    'pipe.s2.p': '用 Cycles 节点合成高度、反照率、法线、云层与夜灯，烘焙成 4K/8K 贴图；场景与模型整理后导出 glTF，不依赖在线模型库。',
    'pipe.s3.l': 'S3 · 实时', 'pipe.s3.h': '浏览器渲染',
    'pipe.s3.p': '自写 GLSL 还原大气散射、晨昏线、海面高光与随视角变化的透视材质；渲染循环离屏即暂停，只在画面变化时重绘。',
    'pipe.s4.l': 'S4 · 叙事', 'pipe.s4.h': '时间轴与交互',
    'pipe.s4.p': '把数据编成可以拖动的时间轴：地质年代与迁徙路线，或者人体的一天。所有文案与数据随包附带，离线可用。',
    'pipe.s4.tools': 'Vite · 离线打包 · 零外部 API',
    'matrix.caption': '每件作品用到了哪些制作环节',
    'matrix.work': '作品', 'matrix.s1': 'S1 数据', 'matrix.s2': 'S2 Blender', 'matrix.s3': 'S3 实时', 'matrix.s4': 'S4 叙事',
    'legend.on': '核心环节', 'legend.part': '部分使用', 'legend.off': '未使用',

    'log.h2': '观测日志',
    'log.subscribe': '订阅 Atom ↗',
    'log.filterAria': '按作品筛选日志',

    'contact.h2': '建立联络',
    'contact.tag': '接受合作',
    'contact.lede': '想把你的数据变成一个可以转动的世界？',
    'contact.sub': '接受科普展陈、数据可视化与交互装置项目的合作。',

    'footer.copy': '© 2026 Rory · 苏州',
    'footer.credits': '影像 NASA Blue Marble / Black Marble · 解剖 Z-Anatomy / BodyParts3D · <a href="https://rory-sun.github.io/earth-chronicle/sources/">资料来源与科学说明</a>',

    // ---- strings used by the browser scripts
    'js.worksTag': '{n} 个目标 · {m} 个模式',
    'js.chip.embed': '页内试玩', 'js.chip.ext': '新标签页',
    'js.mode': '模式', 'js.open': '打开 ↗',
    'js.posterAlt': '{name} 画面',
    'js.scale': '尺度 {v}',
    'js.launch': '▶ 启动演示', 'js.openProject': '打开项目 ↗', 'js.openFull': '打开完整版 ↗',
    'js.hintEmbed': '在本页的画面里直接运行 · 建议使用桌面浏览器',
    'js.hintPhone': '手机屏幕放不下这个界面 · 在新标签页全屏体验',
    'js.hintNewTab': '在新标签页打开',
    'js.breakdown': '技术拆解', 'js.problem': '难点', 'js.approach': '做法', 'js.tradeoff': '取舍', 'js.boundary': '边界',
    'js.loading': '正在载入 {name}…',
    'js.slow': '加载太慢？在新标签页打开 ↗',
    'js.close': '✕ 关闭演示',
    'js.iframeTitle': '{name} 交互演示',
    'js.site': '主页', 'js.all': '全部',
    'js.logCount': '{n} 条记录',
    'js.view': '查看 ↗',
    'js.viewAria': '查看：{name} · {title}',
    'js.more': '展开更早的 {n} 条',
    'js.less': '收起',
  },

  en: {
    'html.lang': 'en',
    'meta.title': 'Rory · Creative technology &amp; 3D visualization',
    'meta.description': 'Rory is a creative technologist in Suzhou, China, with ten years in the field, open to collaboration. Three interactive 3D works built with Blender, Three.js and hand-written shaders: Earth Chronicle, which replays 4.6 billion years; A Day in the Body, built from real anatomical data; and Autumn by the Creek, a place to slow down.',
    'og.locale': 'en_US',
    'og.localeAlt': 'zh_CN',
    'og.description': 'Blender, Three.js and hand-written shaders, turning geological, anatomical and natural data into worlds you can turn by hand. Three works: Earth Chronicle, A Day in the Body, Autumn by the Creek.',
    'og.image': 'https://rory-sun.github.io/site/og-en.jpg',
    'og.imageAlt': 'RORY.studio: creative technology and 3D visualization, beside a rendered 3D Earth',
    'tw.description': 'Blender, Three.js and hand-written shaders, turning geological, anatomical and natural data into worlds you can turn by hand.',
    'url.self': 'https://rory-sun.github.io/en/',
    'url.feed': '/en/feed.xml',
    'feed.title': 'RORY.studio · Observation log',
    'lang.other.href': '/',
    'lang.other.code': 'zh-CN',
    'lang.other.label': '中',
    'lang.other.aria': '阅读中文版',

    'skip': 'Skip to works',
    'nav.aria': 'Site sections',
    'nav.obs': 'Observe', 'nav.works': 'Works', 'nav.file': 'Profile', 'nav.pipe': 'Pipeline', 'nav.log': 'Log', 'nav.contact': 'Contact',
    'clock.zone': 'Suzhou UTC+8',
    'theme.toLight': 'Switch to light mode',
    'theme.toDark': 'Switch to dark mode',
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',
    'edge.sector': 'Sector', 'edge.scroll': 'Scroll', 'edge.vp': 'Viewport', 'edge.targets': 'Targets',
    'sector.obs': '01 Observe', 'sector.works': '02 Works', 'sector.file': '03 Profile', 'sector.pipe': '04 Pipeline', 'sector.log': '05 Log', 'sector.contact': '06 Contact',

    'hero.ready': 'Link ready', 'hero.city': 'Suzhou', 'hero.targets': 'Targets', 'hero.sync': 'Last sync',
    // English wraps at spaces, so no authored break: balance does the work (see site.css)
    'hero.h1': 'I turn complex data and stories into worlds you can <em>turn by hand</em>.',
    'hero.lede': 'Blender, Three.js and hand-written shaders, turning geological, anatomical and natural data into worlds you can turn by hand. Three works so far: an Earth that replays 4.6 billion years, a body that changes over a single day, and a mountain village made for slowing down.',
    'hero.cta': '▸ Open the mission index',
    'hero.cta2': 'Send a signal',
    // "years" lives in the label: "4.6 billion yrs" wrapped mid-unit in the ~95px phone cell
    'tel.1.v': '4.6<small>billion</small>', 'tel.1.l': 'years of Earth history to replay',
    'tel.2.v': '2,331', 'tel.2.l': 'real anatomical parts',
    'tel.3.v': '10<small>years</small>', 'tel.3.l': 'in the field',
    'globe.aria': 'A real-time 3D Earth you can drag to rotate',
    'ro.target': 'Target', 'ro.targetName': 'Earth · TERRA', 'ro.spin': 'Spin θ', 'ro.tilt': 'Tilt', 'ro.fov': 'FOV', 'ro.terminator': '◐ Terminator', 'ro.drag': 'Drag to rotate',

    'works.h2': 'Mission index',
    'works.aria': 'Works. Select one to view it below',
    'ix.code': 'ID', 'ix.work': 'Work', 'ix.scale': 'Scale', 'ix.src': 'Data source', 'ix.size': 'Size', 'ix.access': 'Access',
    'ov.feed': 'Feed',

    'file.h2': 'Operator file',
    'file.tag': 'Translating between science and sight',
    'file.k.alias': 'Alias', 'file.k.focus': 'Focus', 'file.k.loc': 'Based in', 'file.k.years': 'In the field', 'file.k.collab': 'Availability', 'file.k.tools': 'Toolchain', 'file.k.channel': 'Channels',
    'file.v.focus': 'Creative technology · 3D visualization · procedural generation',
    'file.v.loc': 'Suzhou, China',
    'file.v.years': '<span class="mono-num">10</span> years',
    'file.v.collab': 'Open to collaboration',
    'file.thesis': 'How do you help someone understand, in thirty seconds, something that took billions of years to happen? The answer is rarely more text. It is a world they can drag, zoom and rewind.',
    'file.note': 'My work spans 3D modelling, real-time rendering and data engineering. In Blender, node networks procedurally generate terrain, biomes and clouds and bake them into textures; in the browser, Three.js and GLSL rebuild atmospheric scattering, ocean glint and the cycle of day and night; then geological, anatomical and population data become timelines you can play.',
    'file.tags': '<li>Real-time 3D &amp; shaders</li><li>Procedural modelling in Blender</li><li>Data-driven storytelling</li><li>Offline-first web apps</li><li>Science &amp; education</li>',

    'pipe.h2': 'Production pipeline',
    'pipe.tag': 'Data → bake → real time → story',
    'pipe.s1.l': 'S1 · Data', 'pipe.s1.h': 'Collect and organise',
    'pipe.s1.p': 'Coastlines, terrain, anatomical meshes and archaeological sites become structures that can be baked and indexed: Natural Earth rasterised into an 8K land mask, an anatomy model split into 2,331 individually named parts.',
    'pipe.s2.l': 'S2 · Blender', 'pipe.s2.h': 'Procedural and baked',
    'pipe.s2.p': 'Cycles node materials compose height, albedo, normals, clouds and night lights, baked to 4K/8K textures; scenes and models are cleaned up and exported as glTF, with no online model library involved.',
    'pipe.s3.l': 'S3 · Real time', 'pipe.s3.h': 'Rendering in the browser',
    'pipe.s3.p': 'Hand-written GLSL for atmospheric scattering, the day–night terminator, ocean glint and view-dependent translucency; the render loop pauses off screen and redraws only when the picture changes.',
    'pipe.s4.l': 'S4 · Story', 'pipe.s4.h': 'Timelines and interaction',
    'pipe.s4.p': 'Data becomes a timeline you can drag: geological eras and migration routes, or a single day in the body. All copy and data ship with the bundle and work offline.',
    'pipe.s4.tools': 'Vite · offline bundle · zero external APIs',
    'matrix.caption': 'Which production stages each work uses',
    'matrix.work': 'Work', 'matrix.s1': 'S1 Data', 'matrix.s2': 'S2 Blender', 'matrix.s3': 'S3 Real time', 'matrix.s4': 'S4 Story',
    'legend.on': 'Core stage', 'legend.part': 'Partly used', 'legend.off': 'Not used',

    'log.h2': 'Observation log',
    'log.subscribe': 'Subscribe via Atom ↗',
    'log.filterAria': 'Filter the log by work',

    'contact.h2': 'Open a channel',
    'contact.tag': 'Open to collaboration',
    'contact.lede': 'Want to turn your data into a world people can turn?',
    'contact.sub': 'Open to science exhibitions, data visualization and interactive installation projects.',

    'footer.copy': '© 2026 Rory · Suzhou',
    'footer.credits': 'Imagery NASA Blue Marble / Black Marble · Anatomy Z-Anatomy / BodyParts3D · <a href="https://rory-sun.github.io/earth-chronicle/sources/" hreflang="zh-CN">Sources &amp; science notes (in Chinese)</a>',

    'js.worksTag': '{n} targets · {m} modes',
    'js.chip.embed': 'Play here', 'js.chip.ext': 'New tab',
    'js.mode': 'Mode', 'js.open': 'Open ↗',
    'js.posterAlt': '{name} screenshot',
    'js.scale': 'Scale {v}',
    'js.launch': '▶ Launch demo', 'js.openProject': 'Open project ↗', 'js.openFull': 'Open full version ↗',
    'js.hintEmbed': 'Runs right here in the screen · best on a desktop browser',
    'js.hintPhone': 'This interface needs more room than a phone has · opens full screen in a new tab',
    'js.hintNewTab': 'Opens in a new tab',
    'js.breakdown': 'Technical breakdown', 'js.problem': 'Problem', 'js.approach': 'Approach', 'js.tradeoff': 'Trade-off', 'js.boundary': 'Scope',
    'js.loading': 'Loading {name}…',
    'js.slow': 'Too slow? Open in a new tab ↗',
    'js.close': '✕ Close demo',
    'js.iframeTitle': '{name} interactive demo',
    'js.site': 'Site', 'js.all': 'All',
    'js.logCount': '{n} entries',
    'js.view': 'View ↗',
    'js.viewAria': 'View: {name} · {title}',
    'js.more': 'Show {n} earlier entries',
    'js.less': 'Show fewer',
  },
};

// The page's language, read from <html lang> in the browser; 'zh' when imported by Node at build time.
export const LANG = typeof document !== 'undefined' && /^en\b/i.test(document.documentElement.lang || '') ? 'en' : 'zh';

/** Interface string for the current page language, with {name} placeholders filled from vars. */
export function t(key, vars = {}, lang = LANG) {
  const s = STRINGS[lang]?.[key] ?? STRINGS.zh[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** A content field in the current language: record.en[field] on the English page, else record[field]. */
export function loc(record, field, lang = LANG) {
  if (lang === 'en' && record?.en && record.en[field] !== undefined) return record.en[field];
  return record?.[field];
}
