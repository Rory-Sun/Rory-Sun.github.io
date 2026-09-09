// Validates src/products.js so a typo or missing field fails the build instead of silently
// rendering a broken product block or an empty JSON-LD entry.
//   node scripts/validate-products.mjs        (CLI; exits 1 on errors)
//   import { validateProducts } from ...      (used by the Vite plugin at build time)
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const STATUS = new Set(['live', 'soon']);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-f]{6}$/i;
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isHttp = (v) => /^https?:\/\/\S+$/i.test(v);

export function validateProducts(products, { publicDir } = {}) {
  const errors = [];
  const err = (p, i, msg) => errors.push(`products[${i}]${p && p.id ? ` (${p.id})` : ''}: ${msg}`);

  if (!Array.isArray(products)) return ['PRODUCTS must be an array'];
  const ids = new Map();
  products.forEach((p, i) => {
    if (!p || typeof p !== 'object') return err(p, i, 'record must be an object');

    if (!isStr(p.id)) err(p, i, 'id is required');
    else if (!SLUG.test(p.id)) err(p, i, `id "${p.id}" must be a lowercase slug (a-z, 0-9, hyphens)`);
    else if (ids.has(p.id)) err(p, i, `duplicate id "${p.id}" (also products[${ids.get(p.id)}])`);
    else ids.set(p.id, i);

    if (!isStr(p.title)) err(p, i, 'title is required');
    if (!isStr(p.desc)) err(p, i, 'desc is required');
    if (!STATUS.has(p.status)) err(p, i, `status must be one of ${[...STATUS].join(' | ')}, got ${JSON.stringify(p.status)}`);

    const live = p.status === 'live';
    if (p.url !== undefined && !(isStr(p.url) && (isHttp(p.url) || p.url.startsWith('#')))) err(p, i, 'url must be an http(s) URL (or "#..." placeholder)');
    if (live && !isStr(p.url)) err(p, i, 'live products need a url');
    if (p.embed !== undefined && !(isStr(p.embed) && isHttp(p.embed))) err(p, i, 'embed must be an http(s) URL');
    if (p.embed && !live) err(p, i, 'only live products can have an embed');

    if (p.poster !== undefined) {
      if (!isStr(p.poster)) err(p, i, 'poster must be a non-empty string');
      else if (!isHttp(p.poster)) {
        if (!p.poster.startsWith('/')) err(p, i, `poster "${p.poster}" must be an absolute path under public/ or an http(s) URL`);
        else if (publicDir && !existsSync(path.join(publicDir, p.poster))) err(p, i, `poster "${p.poster}" does not exist in public/`);
      }
    }
    if (live && !p.poster && !p.emoji) err(p, i, 'live products need a poster or an emoji for the placeholder');

    if (p.accent !== undefined && !(isStr(p.accent) && HEX.test(p.accent))) err(p, i, `accent must be a #rrggbb color, got ${JSON.stringify(p.accent)}`);
    if (p.tags !== undefined && !(Array.isArray(p.tags) && p.tags.every(isStr))) err(p, i, 'tags must be an array of non-empty strings');
    if (p.features !== undefined) {
      if (!Array.isArray(p.features)) err(p, i, 'features must be an array');
      else p.features.forEach((f, j) => {
        if (!f || !isStr(f.title) || !isStr(f.text)) err(p, i, `features[${j}] needs title and text`);
      });
    }
    for (const k of ['kicker', 'subtitle', 'emoji']) if (p[k] !== undefined && !isStr(p[k])) err(p, i, `${k} must be a non-empty string`);

    const known = new Set(['id', 'kicker', 'title', 'subtitle', 'desc', 'tags', 'poster', 'accent', 'emoji', 'url', 'embed', 'features', 'status']);
    for (const k of Object.keys(p)) if (!known.has(k)) err(p, i, `unknown field "${k}" (typo?)`);
  });
  if (!products.some((p) => p && p.status === 'live')) errors.push('at least one product must be live');
  return errors;
}

// ---- CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { PRODUCTS } = await import(path.join(root, 'src/products.js').replace(/\\/g, '/').replace(/^([A-Za-z]):/, 'file:///$1:'));
  const errors = validateProducts(PRODUCTS, { publicDir: path.join(root, 'public') });
  if (errors.length) {
    console.error(`✖ products.js has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
    process.exit(1);
  }
  console.log(`✔ products.js: ${PRODUCTS.length} records valid (${PRODUCTS.filter((p) => p.status === 'live').length} live)`);
}
