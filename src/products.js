// 产品数据：新增一个项目只需在这里加一条记录，页面会自动生成任务索引的一行、视口与档案。
// 字段说明：
//   id        锚点 id（可用 #id 直达）
//   code      索引编号，如 EC-01；子模式用父编号加后缀，如 EC-01.M
//   kicker    小标题（分类/系列）
//   title / subtitle / desc
//   scale     时间或空间尺度（索引「尺度」列）
//   source    数据来源（索引「数据来源」列）
//   size      规模（索引「规模」列）
//   specs     档案里的规格表 [[标签, 值], ...]
//   stages    制作管线覆盖度 { data, blender, realtime, story }，0 未用 / 1 部分 / 2 核心
//   tags      标签数组
//   poster    海报图路径（视口里的静态画面）
//   accent    作品主色
//   url       完整版链接（新标签页打开）
//   embed     可选：页内嵌入地址（为空则只提供「打开完整版」）
//   demoNote  可选：启动按钮下方的一行说明
//   features  亮点列表 [{ icon, title, text }]
//   status    'live' | 'soon'（soon 是子模式或研发中项目，显示在父作品下方）
//   parent    可选：子模式所属作品的 id
//   blurb     可选：子模式在索引里显示的一句话简介
//
// 展示顺序即叙事顺序：行星的 46 亿年 → 身体的一天 → 村庄的一个下午，尺度层层收缩。
export const PRODUCTS = [
  {
    id: 'earth-chronicle',
    code: 'EC-01',
    kicker: '交互式三维地球',
    title: '地球纪元 · Earth Chronicle',
    subtitle: '46 亿年的行星演化 · 30 万年的人类迁徙',
    desc: '一个完全离线的交互式三维地球平台：拖动旋转，拖动时间轴，看大陆漂移、雪球地球、恐龙灭绝，直到人类的灯光点亮夜空。现代地球使用 NASA Blue Marble 与 Black Marble 卫星影像，远古时代的地形、云层与夜灯由 Blender 程序化生成并烘焙。',
    scale: '46 亿年',
    source: 'NASA Blue Marble · Natural Earth',
    size: '50+ 迁徙路线 · 40 遗址',
    specs: [['尺度', '46 亿年 · 30 万年迁徙'], ['影像', 'NASA Blue Marble / Black Marble'], ['贴图', '4K / 8K 程序化烘焙'], ['依赖', '0 外部 API · 离线运行']],
    stages: { data: 2, blender: 2, realtime: 2, story: 2 },
    // every number and claim below is traceable to the earth-chronicle repo (README, src/earth/Plates.js,
    // src/app/Environment.js, src/earth/shaders.js, commit history)
    breakdown: {
      metrics: [['9', '块板块，各有关键帧'], ['76 × 19', '环境关键帧 × 参数'], ['12 × 4', '每像素大气采样']],
      decisions: [
        { title: '大陆漂移', problem: '46 亿年里大陆的形状和位置一直在变，却没有可以直接逐年使用的板块数据。', approach: '9 块板块各用「参考点移到某经纬度，再绕它扭转」的关键帧描述，以四元数插值。小板块在裂解前依附母板块，例如北美在 1.8 亿年前随非洲一起移动，超大陆因此能无缝拼合。', tradeoff: '这是面向可视化的近似复原，不是科学数据；应用和资料页都写明了这一点。' },
        { title: '一颗地球，四十多亿年', problem: '同一颗地球要依次表现岩浆海、雪球地球、高海平面和植被出现。', approach: '把时间映射成 19 个环境参数（太阳亮度、海平面、冰盖纬度、植被、岩浆、云量、地月距离等）的 76 个分段线性关键帧；着色器只读这些参数，不为每个年代各做一套贴图。', tradeoff: '年代之间是插值过渡，不是逐年的物理模拟。' },
        { title: '大气散射', problem: '贴一层蓝色光晕的大气，在晨昏线和远古的橙色天空下都会露馅。', approach: '光线步进的瑞利与米氏单次散射：视线方向每像素 12 次采样，朝太阳方向 4 次；地质年代的颜色引导瑞利散射，所以冥古宙的天空是橙色的。', tradeoff: '大气层厚度在视觉上放大了约 3 倍，否则在整颗星球的尺度上看不清。' },
        { title: '完全离线', problem: '不想依赖任何在线地图、瓦片或字体服务，打开就能用。', approach: '海岸线来自随包附带的 Natural Earth 数据并栅格化；现代地球影像由脚本把 NASA 原图转成 4K/8K WebP，原图本身不进构建，产物从 266 MB 降到 40 MB。', tradeoff: '默认加载 4K 以照顾集成显卡，8K 需要在地址后加 ?hq=1。' },
      ],
    },
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
    en: {
      title: 'Earth Chronicle',
      subtitle: '4.6 billion years of planetary history · 300,000 years of human migration',
      kicker: 'Interactive 3D Earth',
      desc: 'A fully offline, interactive 3D Earth. Drag to rotate it, drag the timeline to watch continents drift, Snowball Earth freeze over and the dinosaurs fall, until human lights spread across the night side. The present-day Earth uses NASA Blue Marble and Black Marble satellite imagery; terrain, clouds and night lights for earlier eras are generated procedurally in Blender and baked.',
      scale: '4.6 billion years',
      source: 'NASA Blue Marble · Natural Earth',
      size: '50+ migration routes · 40 sites',
      specs: [['Scale', '4.6 billion years · 300,000 years of migration'], ['Imagery', 'NASA Blue Marble / Black Marble'], ['Textures', '4K / 8K procedural bakes'], ['Dependencies', '0 external APIs · runs offline']],
      features: [
        { title: 'Planetary history', text: 'The Hadean magma ocean, the Great Oxidation Event, two Snowball Earths, Pangaea assembling and breaking apart, Cretaceous high seas, the Chicxulub impact and the Quaternary ice ages, all driven by the timeline, with a palaeogeographic mini-map.' },
        { title: 'Human migration', text: 'Across 300,000 years, more than 50 migration routes draw themselves in and 40 archaeological sites light up, with live counts of population, sea level and the edge of the ice sheets.' },
        { title: 'A believable Earth', text: '4K/8K procedural terrain, normal and biome maps, atmospheric scattering, cloud shadows, ocean glint and city lights; the Moon is modelled procedurally in Blender as well.' },
      ],
      breakdown: {
        metrics: [['9', 'plates, each with its own keyframes'], ['76 × 19', 'environment keyframes × parameters'], ['12 × 4', 'atmosphere samples per pixel']],
        decisions: [
          { title: 'Continental drift', problem: 'Continents change shape and position across 4.6 billion years, and there is no year-by-year plate dataset you can simply load.', approach: 'Each of 9 plates is described by keyframes that move a reference point to a longitude and latitude and then twist about it, interpolated as quaternions. Small plates ride on a parent until they rift (North America moves with Africa until 180 million years ago), so supercontinents assemble without seams.', tradeoff: 'This is a reconstruction for visualisation, not scientific data; both the app and its sources page say so.' },
          { title: 'One Earth, four billion years', problem: 'The same globe has to show, in turn, a magma ocean, Snowball Earth, high seas and the arrival of plants.', approach: 'Time maps to 76 piecewise-linear keyframes over 19 environment parameters (sun brightness, sea level, ice latitude, vegetation, lava, cloud cover, Earth–Moon distance and more). The shaders only read those parameters; there is no separate texture set per era.', tradeoff: 'Eras blend by interpolation; it is not a year-by-year physical simulation.' },
          { title: 'Atmospheric scattering', problem: 'A blue halo painted around the planet falls apart at the terminator and under the orange skies of the early Earth.', approach: 'Ray-marched Rayleigh and Mie single scattering, with 12 samples per pixel along the view ray and 4 towards the sun. Each era’s colour steers the Rayleigh term, which is why the Hadean sky is orange.', tradeoff: 'The atmosphere is drawn about three times thicker than reality; at the scale of a whole planet it would otherwise be invisible.' },
          { title: 'Fully offline', problem: 'No online maps, tiles or font services: it should just open and work.', approach: 'Coastlines come from bundled Natural Earth data, rasterised. A script converts NASA’s source imagery to 4K/8K WebP and the originals stay out of the build, which shrank it from 266 MB to 40 MB.', tradeoff: '4K loads by default to spare integrated graphics; 8K needs ?hq=1 on the URL.' },
        ],
      },
    },
    status: 'live',
  },
  {
    id: 'human-atlas',
    code: 'HB-02',
    kicker: '交互式三维人体',
    title: '人体 · 一日',
    subtitle: 'A day in the body',
    desc: '2331 个真实解剖部件在浏览器里重新组装成一个人。网格来自 Z-Anatomy 与 BodyParts3D 的开放医学数据，在 Blender 里整理、着色、导出，不是用球体和胶囊拼出来的近似。拖动一天的时间轴，看心脏、肺与消化如何随睡眠、进食和运动改变；七个系统各自可以显隐，外壳可以透明，整个人可以展开成一张解剖爆炸图。',
    scale: '24 小时',
    source: 'Z-Anatomy · BodyParts3D',
    size: '2331 部件 · 7 系统',
    specs: [['尺度', '24 小时 · 4 种状态'], ['数据', 'Z-Anatomy / BodyParts3D'], ['部件', '2331 个 · 7 个系统'], ['载荷', '约 28 MB · 建议全屏']],
    stages: { data: 2, blender: 2, realtime: 2, story: 2 },
    // sources: blender-designer anatomy/README.md, web/anatomy/assets/web-lod.json (summed),
    // web/anatomy/parts.js and src.js comments
    breakdown: {
      metrics: [['2331', '个独立命名的部件'], ['685 万 → 192 万', '三角面，网页保留 28%'], ['26', '个结构组，一组一次绘制']],
      decisions: [
        { title: '真实网格太重', problem: 'Z-Anatomy 的原始网格对浏览器来说太重，但人体又不能用球体和胶囊去近似。', approach: '在 Blender 里保留完整精度的场景，另外生成网页用的简化版：26 个结构组原始约 685 万个三角面，网页版约 192 万；简化结果不写回完整模型。', tradeoff: '主模型仍有约 28 MB，第一次打开要等它下载完。' },
        { title: '叠在一起的白雾', problem: '颅骨、胸廓和肺是半透明层层叠加的，每一层加一样的透明度，最后就是一团白雾。', approach: '运行时重新指定材质：正对镜头的地方更透明、轮廓处更实，叠起来是 X 光一样的轮廓。后处理改用 4 倍多重采样的渲染目标，细血管和骨骼边缘不再出现锯齿。', tradeoff: '浏览器里的材质与 Blender 场景里的不同，两边需要分别调。' },
        { title: '展开而不切碎', problem: '把一个人展开成 2331 个部件，既不能切碎网格，也不能让坐标误差越积越多。', approach: '部件按系统批量绘制，每个系统一次绘制调用，每个部件整体平移；归位时偏移归零，再切回精细模型。部件网格约 54 MB，第一次点「展开」时才下载。', tradeoff: '展开状态下保持静止，器官动画只在组合状态下播放。' },
        { title: '在 2331 个英文名里找东西', problem: '部件都是英文原名，绝大多数访客不会去搜「Femur」。', approach: '搜索只查目录，不下载网格；支持「肾」「股骨」这类常见中文关键词和英文原名，点中结果后才按需加载、定位并高亮。', tradeoff: '还没有完整的中文解剖术语翻译，冷门部件仍要用英文搜。' },
      ],
      boundary: '这是教育用的解剖展示与动画样机，不是生理数字孪生；心率和呼吸是演示预设，器官比例与位置尚未经独立医学专家审查。',
    },
    tags: ['真实解剖数据', '2331 个部件', '系统显隐', '一天时间轴', 'Blender 导出'],
    poster: '/site/human_atlas_1200.webp',
    accent: '#c98f4e',
    emoji: '🫀',
    url: 'https://rory-sun.github.io/blender-designer/anatomy/',
    // no embed: the model alone is 28MB, and the three-column lab UI needs far more room than an
    // in-page frame gives it
    demoNote: '解剖模型约 28MB · 建议在新标签页全屏体验',
    features: [
      { icon: '🫀', title: '真实的身体', text: '解剖网格来自 Z-Anatomy 与 BodyParts3D 的开放医学数据，在 Blender 中整理导出；骨骼、肺与肌肉使用随视角变化的透视材质，叠起来是 X 光轮廓而不是白雾。' },
      { icon: '🕘', title: '身体的一天', text: '拖动时间轴走完 24 小时，睡眠、进食、日常与运动四种状态驱动心率与呼吸；器官节律与时间快进是两套独立的控制。' },
      { icon: '🔍', title: '展开到部件', text: '一次点击把整个人展开成 2331 个独立命名的部件，可以停在任意展开程度，也可以搜索「肾」「股骨」或英文原名定位并高亮。' },
    ],
    en: {
      title: 'A Day in the Body',
      subtitle: 'Interactive anatomy lab',
      kicker: 'Interactive 3D anatomy',
      desc: '2,331 real anatomical parts reassembled into a person in the browser. The meshes come from the open medical data of Z-Anatomy and BodyParts3D, cleaned up, shaded and exported in Blender, not approximated with spheres and capsules. Drag a 24-hour timeline to see the heart, lungs and digestion respond to sleep, meals and exercise; seven body systems switch on and off, the skin turns translucent, and the whole body can be exploded into its parts.',
      scale: '24 hours',
      source: 'Z-Anatomy · BodyParts3D',
      size: '2,331 parts · 7 systems',
      specs: [['Scale', '24 hours · 4 states'], ['Data', 'Z-Anatomy / BodyParts3D'], ['Parts', '2,331 · 7 systems'], ['Payload', 'about 28 MB · full screen recommended']],
      demoNote: 'The anatomy model is about 28 MB · best opened full screen in a new tab',
      features: [
        { title: 'A real body', text: 'The meshes come from the open medical data of Z-Anatomy and BodyParts3D, prepared and exported in Blender. Bone, lung and muscle use view-dependent translucency, so stacked layers read as an X-ray outline instead of white haze.' },
        { title: 'A day in the body', text: 'Drag through 24 hours: sleep, meals, daily activity and exercise drive heart rate and breathing. Organ rhythm and the time-lapse are controlled separately.' },
        { title: 'Down to the parts', text: 'One click explodes the body into 2,331 individually named parts. Stop at any point, or search for a part by its original name (or, on the Chinese interface, a keyword like 肾) to find and highlight it.' },
      ],
      breakdown: {
        metrics: [['2,331', 'individually named parts'], ['6.85M → 1.92M', 'triangles; the web keeps 28%'], ['26', 'structure groups, one draw each']],
        decisions: [
          { title: 'Real meshes are heavy', problem: 'Z-Anatomy’s original meshes are too heavy for a browser, yet the body cannot be faked with spheres and capsules.', approach: 'Blender keeps a full-resolution scene and generates a separate version for the web: 26 structure groups go from about 6.85 million triangles to about 1.92 million, and the simplification is never written back into the full model.', tradeoff: 'The main model is still about 28 MB, so a first visit waits for it to download.' },
          { title: 'Stacked layers turn to haze', problem: 'Skull, ribcage and lungs are translucent layers stacked on one another; give every layer the same opacity and you get a white fog.', approach: 'Materials are reassigned at runtime: surfaces facing the camera are more transparent and silhouettes more solid, so stacks read like an X-ray. Post-processing renders into a 4× multisampled target, so thin vessels and bone edges stay free of jagged edges.', tradeoff: 'Materials in the browser differ from those in the Blender scene, so the two have to be tuned separately.' },
          { title: 'Explode without shredding', problem: 'Exploding a body into 2,331 parts must neither cut meshes apart nor let coordinate errors pile up.', approach: 'Parts are drawn in batches by system, one draw call per system, and each part moves as a rigid whole. Reassembly zeroes the offsets and swaps back to the detailed model. The part meshes, about 54 MB, download only the first time you press “explode”.', tradeoff: 'The body holds still while exploded; organ animation runs only when it is assembled.' },
          { title: 'Finding one part in 2,331', problem: 'Every part carries its original anatomical name in English or Latin, which most of the project’s Chinese-speaking visitors would never type.', approach: 'Search queries the catalogue only, without downloading meshes. It accepts common Chinese keywords such as 肾 (kidney) and 股骨 (femur) as well as the original names, and loads, frames and highlights a part only once you pick it.', tradeoff: 'There is no complete Chinese anatomical glossary yet, so rarer parts still need their English names.' },
        ],
        boundary: 'This is an educational anatomy display and animation prototype, not a physiological digital twin. Heart and breathing rates are demo presets, and organ proportions and positions have not been reviewed by an independent medical expert.',
      },
    },
    status: 'live',
  },
  {
    id: 'autumn-creek',
    code: 'AC-03',
    kicker: '交互式三维风景',
    title: '溪畔秋日',
    subtitle: 'A place to slow down',
    desc: '走进溪畔秋日。自由环绕一座三维山村，点击石桥、稻田与小狗，听见溪水与鸟鸣——一个为放慢节奏而做的沉浸式场景。',
    scale: '一个下午',
    source: 'Blender 程序化场景',
    size: '三维山村 · 环境声景',
    specs: [['尺度', '一个秋天的下午'], ['场景', 'Blender 程序化建模'], ['素材', 'Poly Haven CC0 实景扫描'], ['交互', '4 个预设视角 · 可点击热点'], ['声音', 'Web Audio 实时合成']],
    // data = 1: textures and plant/rock models are fetched from Poly Haven (CC0) with sources and
    // licences tracked in web/assets/sources.json — a real sourcing pipeline, but not scientific data
    stages: { data: 1, blender: 2, realtime: 2, story: 1 },
    // sources: blender-designer web/README.md, web/assets/scene-info.json, web/src/{puppy-motion,
    // water,vegetation,audio}.js
    breakdown: {
      metrics: [['442 → 10', '个场景对象 → 绘制批次'], ['75,050', '个顶点'], ['0', '段录音，声音全部实时合成']],
      decisions: [
        { title: '一整座山村的开销', problem: '溪流、稻田、瓦屋和树林加起来有几百个对象，逐个绘制在普通电脑上会卡。', approach: '导出的 442 个对象整理成 10 个绘制批次；近景草丛和蕨类用 Poly Haven 的 CC0 模型批量实例化；中景树木用实体树冠，只有最远处的雾中树林才用贴片。', tradeoff: '手机上会自动减少植被数量，降低反射与阴影精度。' },
        { title: '小狗不像玩具', problem: '四条腿按固定节奏摆动的小狗，看起来像发条玩具在滑行。', approach: '按实际移动距离驱动步幅，脚掌固定在世界坐标里，用双关节反向动力学保持落点；站立时脚掌保持水平，不随小腿转动；还处理了转弯补步、加减速，以及间歇停下嗅闻。', tradeoff: '小狗网格由参考图生成，骨骼权重和步态是另外配置的；毛发靠模型与纹理表现，没有独立的毛发模拟。' },
        { title: '水不是一层蓝色', problem: '给水面涂一层蓝色加反射，看起来像塑料。', approach: '按河道横向位置估算水深：浅处透出河床，深处吸收更多光；菲涅耳让贴地角度的反射更强；点击水面会泛起涟漪。', tradeoff: '这是估算，不是流体模拟。' },
        { title: '没有一段录音', problem: '环境声如果用循环录音，几十秒后就能听出接缝。', approach: '用 Web Audio 实时合成：滤波后的噪声是流水，振荡器生成鸟鸣并随机间隔出现，点水时有一声水响；标签页隐藏时自动暂停。', tradeoff: '音量全局统一，不随镜头位置变化。' },
      ],
    },
    tags: ['三维场景', '环境音效', '点击互动', '氛围叙事'],
    poster: '/site/autumn_creek_1200.webp',   // self-hosted 1200px copy of blender-designer/preview-desktop.png
    accent: '#3f7a4a',
    emoji: '🍂',
    url: 'https://rory-sun.github.io/blender-designer/?v=3d-final',
    embed: 'https://rory-sun.github.io/blender-designer/?v=3d-final',
    features: [
      { icon: '🏞️', title: '自由环绕', text: '拖动镜头在山村间环绕，秋色随视角变化，溪水在脚下流过。' },
      { icon: '🐕', title: '可点击的世界', text: '石桥、稻田与小狗都能触发互动与声音，细节里藏着惊喜。' },
      { icon: '🎧', title: '合成声景', text: '溪流与鸟鸣不是录音，而是用 Web Audio 在浏览器里实时合成；点击溪水会泛起涟漪，并发出一声水响。' },
    ],
    en: {
      title: 'Autumn by the Creek',
      subtitle: 'A place to slow down',
      kicker: 'Interactive 3D landscape',
      desc: 'Step into a 3D mountain village and orbit it freely. Click the stone bridge, the rice fields and the dog, and listen to the creek and the birds: an immersive scene made for slowing down.',
      scale: 'One afternoon',
      source: 'Procedural Blender scene',
      size: '3D village · ambient soundscape',
      specs: [['Scale', 'One autumn afternoon'], ['Scene', 'Procedural Blender modelling'], ['Assets', 'Poly Haven CC0 photoscans'], ['Interaction', '4 preset views · clickable hotspots'], ['Sound', 'Synthesised live with Web Audio']],
      features: [
        { title: 'Free orbit', text: 'Drag the camera around the village; the autumn colours shift with the view and the creek runs beneath you.' },
        { title: 'A world you can click', text: 'The stone bridge, the rice fields and the dog all respond with interactions and sounds; there are surprises in the details.' },
        { title: 'Synthesised soundscape', text: 'The creek and the birdsong are not recordings: they are synthesised live in the browser with Web Audio. Click the water and it ripples, with a splash.' },
      ],
      breakdown: {
        metrics: [['442 → 10', 'scene objects → draw batches'], ['75,050', 'vertices'], ['0', 'recordings; every sound is synthesised']],
        decisions: [
          { title: 'The cost of a whole village', problem: 'Creek, rice fields, tiled houses and woods add up to hundreds of objects, and drawing them one by one stutters on an ordinary computer.', approach: 'The 442 exported objects are organised into 10 draw batches. Nearby grass and ferns are Poly Haven CC0 models instanced in bulk; mid-distance trees have solid crowns, and only the farthest woods in the haze are flat cards.', tradeoff: 'On phones it automatically thins the vegetation and lowers reflection and shadow quality.' },
          { title: 'A dog, not a toy', problem: 'A dog whose four legs swing to a fixed rhythm looks like a wind-up toy sliding along.', approach: 'Stride is driven by the distance actually travelled, paws are pinned in world space, and two-bone inverse kinematics keeps them planted. Paws stay level while bearing weight instead of rotating with the shin; turning steps, acceleration, braking and pauses to sniff are handled too.', tradeoff: 'The dog mesh was generated from a reference image, with the rig weights and gait set up separately; the fur comes from the model and textures, with no separate hair simulation.' },
          { title: 'Water that is not just blue', problem: 'Paint the water blue and add a reflection, and it looks like plastic.', approach: 'Depth is estimated from position across the channel: shallows show the riverbed, deeper water absorbs more light, and a Fresnel term strengthens reflections at grazing angles. Clicking the water sends out ripples.', tradeoff: 'It is an estimate, not a fluid simulation.' },
          { title: 'Not a single recording', problem: 'A looped ambient recording gives away its seam within a minute.', approach: 'Everything is synthesised live with Web Audio: filtered noise for the stream, oscillators for birdsong at random intervals, and a splash when you click the water. It pauses when the tab is hidden.', tradeoff: 'Volume is global; it does not change with the camera position.' },
        ],
      },
    },
    status: 'live',
  },
  {
    id: 'moon-mode',
    code: 'EC-01.M',
    parent: 'earth-chronicle',
    kicker: '地球纪元 · 新视角',
    title: '月球',
    blurb: '同一条时间轴下的月球史：从忒伊亚大碰撞到阿波罗与嫦娥着陆点',
    desc: '同一条时间轴下的月球史：忒伊亚大碰撞、岩浆洋、晚期重轰击、月海喷发、逐渐远离地球，直到阿波罗与嫦娥的着陆点一一亮起。作为地球纪元的第四个模式上线。',
    emoji: '🌙',
    accent: '#7a86a8',
    url: 'https://rory-sun.github.io/earth-chronicle/?mode=moon',
    en: {
      title: 'The Moon',
      kicker: 'Earth Chronicle · new view',
      desc: 'The Moon on the same timeline: the Theia impact, the magma ocean, the Late Heavy Bombardment, mare eruptions and the slow drift away from Earth, until the Apollo and Chang’e landing sites light up one by one. Launched as Earth Chronicle’s fourth mode.',
      blurb: 'The Moon on the same timeline, from the Theia impact to the Apollo and Chang’e landing sites',
    },
    status: 'soon',
  },
  {
    id: 'tree-of-life',
    code: 'EC-01.L',
    parent: 'earth-chronicle',
    kicker: '地球纪元 · 新视角',
    title: '生命之树',
    blurb: '约 90 个谱系，与地球纪元共用一条时间轴',
    desc: '一棵可缩放的演化树，与地球纪元共用一条时间轴：拖动时间，谱系随之生长；灭绝的支系停在原地标上 †；点击任一物种查看简介并跳到它的起源时刻。约 90 个谱系，从最后共同祖先到智人。',
    emoji: '🧬',
    accent: '#8a5aa8',
    url: 'https://rory-sun.github.io/earth-chronicle/?mode=life',
    en: {
      title: 'Tree of Life',
      kicker: 'Earth Chronicle · new view',
      desc: 'A zoomable evolutionary tree that shares Earth Chronicle’s timeline: drag through time and lineages grow; extinct branches stop where they end, marked †; click any species for a summary and jump to the moment it appeared. About 90 lineages, from the last universal common ancestor to Homo sapiens.',
      blurb: 'About 90 lineages, sharing Earth Chronicle’s timeline',
    },
    status: 'soon',
  },
];

