import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PRODUCTS } from './src/products.js';
import { validateProducts } from './scripts/validate-products.mjs';

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
    description: '用 Blender、Three.js 与自写着色器构建沉浸式交互体验；把地质、考古与人口数据编成可以播放的时间轴。',
    sameAs: ['https://github.com/Rory-Sun'],
    knowsAbout: ['实时三维与着色器', 'Blender 程序化建模', '数据可视化叙事', '离线优先的 Web 应用', '科普与教育产品', 'Three.js', 'GLSL', 'Blender'],
  };
  const live = PRODUCTS.filter((p) => p.status !== 'soon' && p.url && !p.url.startsWith('#'));
  const modes = PRODUCTS.filter((p) => p.status === 'soon' && p.url);
  const works = live.map((p) => {
    const parts = modes.filter((m) => m.url.startsWith(p.url.split('?')[0]));
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

function seoPlugin() {
  let isBuild = false;
  return {
    name: 'rory-seo',
    configResolved(config) { isBuild = config.command === 'build'; },
    // fail the production build (and warn loudly in dev) when a product record is malformed
    buildStart() {
      const errors = validateProducts(PRODUCTS, { publicDir: path.join(ROOT, 'public') });
      if (!errors.length) return;
      const msg = `products.js has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`;
      if (isBuild) throw new Error(msg);
      console.warn(`\n[rory-seo] ${msg}\n`);
    },
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: structuredData(), injectTo: 'head' }];
    },
    generateBundle() {
      const lastmod = new Date().toISOString().slice(0, 10);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml });
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [seoPlugin()],
  server: { host: '127.0.0.1', port: 5174 },
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
