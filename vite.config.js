import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PRODUCTS } from './src/products.js';
import { UPDATES } from './src/updates.js';
import { validateProducts, validateUpdates } from './scripts/validate-products.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const SITE = 'https://rory-sun.github.io/';
const abs = (u) => (!u ? undefined : u.startsWith('http') ? u : new URL(u.replace(/^\//, ''), SITE).href);

// JSON-LD (schema.org) describing the site owner and every published product, generated from
// src/products.js so new records are picked up automatically. Injected into <head> at build/dev time.
function structuredData() {
  const person = {
    '@type': 'Person',
    '@id': `${SITE}#rory`,
    name: 'Rory',
    url: SITE,
    email: 'mailto:sunzhiyang49@gmail.com',
    jobTitle: '创意技术 · 三维可视化',
    description: '在苏州工作的创意技术从业者，从业十年，接受合作。用 Blender、Three.js 与自写着色器构建沉浸式交互体验；把地质、解剖与自然的数据编成可以播放的时间轴。',
    address: { '@type': 'PostalAddress', addressLocality: '苏州', addressCountry: 'CN' },
    sameAs: ['https://github.com/Rory-Sun'],
    knowsAbout: ['实时三维与着色器', 'Blender 程序化建模', '数据可视化叙事', '离线优先的 Web 应用', '科普与教育产品', 'Three.js', 'GLSL', 'Blender'],
  };
  const live = PRODUCTS.filter((p) => p.status !== 'soon' && p.url && !p.url.startsWith('#'));
  const works = live.map((p) => {
    const parts = PRODUCTS.filter((m) => m.parent === p.id && m.url);
    return {
      '@type': 'WebApplication',
      '@id': `${SITE}#${p.id}`,
      name: p.title,
      alternateName: p.subtitle || undefined,
      description: p.desc,
      url: p.url,
      image: abs(p.poster),
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web browser',
      browserRequirements: 'Requires WebGL',
      isAccessibleForFree: true,
      inLanguage: 'zh-CN',
      keywords: (p.tags || []).join(', '),
      author: { '@id': person['@id'] },
      hasPart: parts.length ? parts.map((m) => ({ '@type': 'WebApplication', name: m.title, description: m.desc, url: m.url })) : undefined,
    };
  });
  const site = {
    '@type': 'WebSite',
    '@id': `${SITE}#site`,
    url: SITE,
    name: 'RORY.studio',
    description: 'Rory 的个人网站：作品、产品与实验。',
    inLanguage: 'zh-CN',
    author: { '@id': person['@id'] },
  };
  const page = {
    '@type': 'ProfilePage',
    '@id': SITE,
    url: SITE,
    isPartOf: { '@id': site['@id'] },
    mainEntity: { '@id': person['@id'] },
    hasPart: works.map((w) => ({ '@id': w['@id'] })),
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [site, page, person, ...works] }).replace(/</g, '\\u003c');
}

// Atom feed of the 观测日志 (src/updates.js) so the site can be followed in a feed reader.
// Entry ids hash date + target + title, so they stay stable as long as the entry is not reworded.
const xmlEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function atomFeed() {
  const nameOf = (id) => (id === 'site' ? 'RORY.studio' : (PRODUCTS.find((p) => p.id === id)?.title || id).split(' · ')[0]);
  const stamp = (d) => `${d}T12:00:00+08:00`;
  const entries = UPDATES.map((u) => {
    const hash = createHash('sha1').update(`${u.date}|${u.target}|${u.title}`).digest('hex').slice(0, 12);
    const title = `${nameOf(u.target)} · ${u.title}`;
    return `  <entry>
    <id>tag:rory-sun.github.io,${u.date}:log/${hash}</id>
    <title>${xmlEsc(title)}</title>
    <updated>${stamp(u.date)}</updated>
    <link rel="alternate" href="${xmlEsc(u.url || `${SITE}#log`)}"/>
    <summary type="text">${xmlEsc(u.text)}</summary>
  </entry>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-CN">
  <id>${SITE}</id>
  <title>RORY.studio · 观测日志</title>
  <subtitle>Rory 的个人主页与三件交互式三维作品的更新记录</subtitle>
  <link rel="self" href="${SITE}feed.xml"/>
  <link rel="alternate" href="${SITE}#log"/>
  <author><name>Rory</name><uri>${SITE}</uri></author>
  <updated>${stamp(UPDATES[0]?.date || '2026-01-01')}</updated>
${entries}
</feed>
`;
}

function seoPlugin() {
  let isBuild = false;
  return {
    name: 'rory-seo',
    configResolved(config) { isBuild = config.command === 'build'; },
    // fail the production build (and warn loudly in dev) when a product record or log entry is malformed
    buildStart() {
      const errors = [
        ...validateProducts(PRODUCTS, { publicDir: path.join(ROOT, 'public') }).map((e) => `products.js ${e}`),
        ...validateUpdates(UPDATES, PRODUCTS).map((e) => `updates.js ${e}`),
      ];
      if (!errors.length) return;
      const msg = `${errors.length} data problem(s):\n  - ${errors.join('\n  - ')}`;
      if (isBuild) throw new Error(msg);
      console.warn(`\n[rory-seo] ${msg}\n`);
    },
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: structuredData(), injectTo: 'head' }];
    },
    generateBundle() {
      // lastmod is the newest real update, not the build date: rebuilding without content changes
      // should not tell crawlers the page changed
      const lastmod = UPDATES[0]?.date || new Date().toISOString().slice(0, 10);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml });
      this.emitFile({ type: 'asset', fileName: 'feed.xml', source: atomFeed() });
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [seoPlugin()],
  server: { host: '127.0.0.1', port: 5174 },
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
