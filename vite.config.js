import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PRODUCTS } from './src/products.js';
import { UPDATES } from './src/updates.js';
import { STRINGS, loc } from './src/i18n.js';
import { validateProducts, validateUpdates, validateI18n } from './scripts/validate-products.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://rory-sun.github.io/';
const HOME = { zh: SITE, en: `${SITE}en/` };
const abs = (u) => (!u ? undefined : u.startsWith('http') ? u : new URL(u.replace(/^\//, ''), SITE).href);
const readTemplate = () => readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 「地球纪元 · Earth Chronicle」→「地球纪元」; 「人体 · 一日」stays whole (the part after the dot is not Latin)
const zhName = (p) => { const [a, b] = p.title.split(' · '); return b && /^[A-Za-z]/.test(b) ? a : p.title; };
const nameIn = (p, lang) => (lang === 'en' ? loc(p, 'title', 'en') : zhName(p));

// ---------------------------------------------------------------------------------------------
// i18n: index.html is a template. It becomes / (zh); en/index.html is a stub that becomes /en/.
// ---------------------------------------------------------------------------------------------
const langOf = (ctx) => (/[\\/]en[\\/]index\.html$/.test(ctx?.filename || '') || /^\/en\//.test(ctx?.path || '') ? 'en' : 'zh');
function fill(html, lang) {
  return html.replace(/\{\{([\w.]+)\}\}/g, (m, key) => {
    const v = STRINGS[lang][key];
    if (v === undefined) throw new Error(`[rory-i18n] missing string "${key}" for ${lang}`);
    return v;
  });
}
function i18nPlugin() {
  return {
    name: 'rory-i18n',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const lang = langOf(ctx);
        return fill(lang === 'en' ? readTemplate() : html, lang);
      },
    },
  };
}

// ---------------------------------------------------------------------------------------------
// JSON-LD (schema.org) per language, generated from products.js
// ---------------------------------------------------------------------------------------------
function structuredData(lang) {
  const en = lang === 'en';
  const person = {
    '@type': 'Person',
    '@id': `${SITE}#rory`,
    name: 'Rory',
    url: HOME[lang],
    email: 'mailto:sunzhiyang49@gmail.com',
    jobTitle: en ? 'Creative technologist · 3D visualization' : '创意技术 · 三维可视化',
    description: en
      ? 'A creative technologist based in Suzhou, China, ten years in the field and open to collaboration. Builds immersive interactive work with Blender, Three.js and hand-written shaders, turning geological, anatomical and natural data into timelines you can play.'
      : '在苏州工作的创意技术从业者，从业十年，接受合作。用 Blender、Three.js 与自写着色器构建沉浸式交互体验；把地质、解剖与自然的数据编成可以播放的时间轴。',
    address: { '@type': 'PostalAddress', addressLocality: en ? 'Suzhou' : '苏州', addressCountry: 'CN' },
    sameAs: ['https://github.com/Rory-Sun'],
    knowsAbout: en
      ? ['Real-time 3D and shaders', 'Procedural modelling in Blender', 'Data-driven storytelling', 'Offline-first web apps', 'Science and education', 'Three.js', 'GLSL', 'Blender']
      : ['实时三维与着色器', 'Blender 程序化建模', '数据可视化叙事', '离线优先的 Web 应用', '科普与教育产品', 'Three.js', 'GLSL', 'Blender'],
  };
  const live = PRODUCTS.filter((p) => p.status === 'live' && p.url && !p.url.startsWith('#'));
  const works = live.map((p) => {
    const parts = PRODUCTS.filter((m) => m.parent === p.id && m.url);
    return {
      '@type': 'WebApplication',
      '@id': `${SITE}#${p.id}`,
      name: nameIn(p, lang),
      alternateName: nameIn(p, en ? 'zh' : 'en'),
      description: loc(p, 'desc', lang),
      url: p.url,
      image: abs(p.poster),
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web browser',
      browserRequirements: 'Requires WebGL',
      isAccessibleForFree: true,
      inLanguage: 'zh-CN',
      author: { '@id': person['@id'] },
      hasPart: parts.length ? parts.map((m) => ({ '@type': 'WebApplication', name: loc(m, 'title', lang), description: loc(m, 'desc', lang), url: m.url })) : undefined,
    };
  });
  const site = { '@type': 'WebSite', '@id': `${SITE}#site`, url: SITE, name: 'RORY.studio', inLanguage: ['zh-CN', 'en'], author: { '@id': person['@id'] } };
  const page = {
    '@type': 'ProfilePage',
    '@id': HOME[lang],
    url: HOME[lang],
    inLanguage: STRINGS[lang]['html.lang'],
    isPartOf: { '@id': site['@id'] },
    mainEntity: { '@id': person['@id'] },
    hasPart: works.map((w) => ({ '@id': w['@id'] })),
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [site, page, person, ...works] }).replace(/</g, '\\u003c');
}

// ---------------------------------------------------------------------------------------------
// Atom feed of the log, one per language. Chinese entry ids hash date + target + title so they
// stay stable as long as the entry is not reworded; English ids add a suffix so they never collide.
// ---------------------------------------------------------------------------------------------
const xmlEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function atomFeed(lang) {
  const en = lang === 'en';
  const nameOf = (id) => (id === 'site' ? 'RORY.studio' : nameIn(PRODUCTS.find((p) => p.id === id) || { title: id }, lang));
  const stamp = (d) => `${d}T12:00:00+08:00`;
  const self = en ? `${SITE}en/feed.xml` : `${SITE}feed.xml`;
  const entries = UPDATES.map((u) => {
    const hash = createHash('sha1').update(`${u.date}|${u.target}|${u.title}${en ? '|en' : ''}`).digest('hex').slice(0, 12);
    return `  <entry>
    <id>tag:rory-sun.github.io,${u.date}:log/${hash}</id>
    <title>${xmlEsc(`${nameOf(u.target)} · ${loc(u, 'title', lang)}`)}</title>
    <updated>${stamp(u.date)}</updated>
    <link rel="alternate" href="${xmlEsc(loc(u, 'url', lang) || `${HOME[lang]}#log`)}"/>
    <summary type="text">${xmlEsc(loc(u, 'text', lang))}</summary>
  </entry>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${STRINGS[lang]['html.lang']}">
  <id>${HOME[lang]}</id>
  <title>${xmlEsc(STRINGS[lang]['feed.title'])}</title>
  <subtitle>${en ? 'Updates to Rory’s homepage and three interactive 3D works' : 'Rory 的个人主页与三件交互式三维作品的更新记录'}</subtitle>
  <link rel="self" href="${self}"/>
  <link rel="alternate" href="${HOME[lang]}#log"/>
  <author><name>Rory</name><uri>${SITE}</uri></author>
  <updated>${stamp(UPDATES[0]?.date || '2026-01-01')}</updated>
${entries}
</feed>
`;
}

// sitemap: both language versions, each declaring the other as an alternate
function sitemap() {
  // lastmod is the newest real update, not the build date: rebuilding without content changes
  // should not tell crawlers the page changed
  const lastmod = UPDATES[0]?.date || new Date().toISOString().slice(0, 10);
  const alts = `<xhtml:link rel="alternate" hreflang="zh-CN" href="${HOME.zh}"/><xhtml:link rel="alternate" hreflang="en" href="${HOME.en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${HOME.zh}"/>`;
  const url = (loc_, pri) => `  <url><loc>${loc_}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${pri}</priority>${alts}</url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${url(HOME.zh, '1.0')}\n${url(HOME.en, '0.9')}\n</urlset>\n`;
}

function seoPlugin() {
  let isBuild = false;
  return {
    name: 'rory-seo',
    configResolved(config) { isBuild = config.command === 'build'; },
    // fail the production build (and warn loudly in dev) on malformed data or missing translations
    buildStart() {
      const errors = [
        ...validateProducts(PRODUCTS, { publicDir: path.join(ROOT, 'public') }).map((e) => `products.js ${e}`),
        ...validateUpdates(UPDATES, PRODUCTS).map((e) => `updates.js ${e}`),
        ...validateI18n({ strings: STRINGS, template: readTemplate(), products: PRODUCTS, updates: UPDATES }).map((e) => `i18n ${e}`),
      ];
      if (!errors.length) return;
      const msg = `${errors.length} data problem(s):\n  - ${errors.join('\n  - ')}`;
      if (isBuild) throw new Error(msg);
      console.warn(`\n[rory-seo] ${msg}\n`);
    },
    transformIndexHtml(html, ctx) {
      return [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: structuredData(langOf(ctx)), injectTo: 'head' }];
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() });
      this.emitFile({ type: 'asset', fileName: 'feed.xml', source: atomFeed('zh') });
      this.emitFile({ type: 'asset', fileName: 'en/feed.xml', source: atomFeed('en') });
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [i18nPlugin(), seoPlugin()],
  server: { host: '127.0.0.1', port: 5174 },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: { input: { main: path.join(ROOT, 'index.html'), en: path.join(ROOT, 'en/index.html') } },
  },
});
