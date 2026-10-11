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
    for (const k of ['kicker', 'subtitle', 'emoji', 'demoNote', 'scale', 'source', 'size', 'blurb']) if (p[k] !== undefined && !isStr(p[k])) err(p, i, `${k} must be a non-empty string`);

    // mission-index fields
    if (p.code !== undefined && !(isStr(p.code) && /^[A-Z]{2}-\d{2}(\.[A-Z])?$/.test(p.code))) err(p, i, `code must look like EC-01 or EC-01.M, got ${JSON.stringify(p.code)}`);
    if (live) for (const k of ['code', 'scale', 'source', 'size']) if (!isStr(p[k])) err(p, i, `live products need ${k} (shown as a column in the mission index)`);
    if (p.specs !== undefined && !(Array.isArray(p.specs) && p.specs.every((r) => Array.isArray(r) && r.length === 2 && r.every(isStr)))) err(p, i, 'specs must be an array of [label, value] string pairs');
    if (p.stages !== undefined) {
      const ok = p.stages && typeof p.stages === 'object' && ['data', 'blender', 'realtime', 'story'].every((k) => [0, 1, 2].includes(p.stages[k]));
      if (!ok) err(p, i, 'stages must be { data, blender, realtime, story } with each value 0, 1 or 2');
    }
    if (p.parent !== undefined) {
      const parent = products.find((q) => q && q.id === p.parent);
      if (!parent) err(p, i, `parent "${p.parent}" does not match any product id`);
      else if (parent.status !== 'live') err(p, i, `parent "${p.parent}" must be a live product`);
      if (live) err(p, i, 'a live product cannot have a parent; modes are status "soon"');
    }

    const known = new Set(['id', 'code', 'kicker', 'title', 'subtitle', 'desc', 'scale', 'source', 'size', 'specs', 'stages', 'tags', 'poster', 'accent', 'emoji', 'url', 'embed', 'demoNote', 'features', 'status', 'parent', 'blurb']);
    for (const k of Object.keys(p)) if (!known.has(k)) err(p, i, `unknown field "${k}" (typo?)`);
  });
  if (!products.some((p) => p && p.status === 'live')) errors.push('at least one product must be live');
  return errors;
}

// Validates src/updates.js (the 观测日志): real calendar dates, newest first, targets that exist.
export function validateUpdates(updates, products) {
  const errors = [];
  if (!Array.isArray(updates)) return ['UPDATES must be an array'];
  const ids = new Set((products || []).map((p) => p && p.id));
  const known = new Set(['date', 'target', 'title', 'text', 'url']);
  updates.forEach((u, i) => {
    const err = (msg) => errors.push(`updates[${i}]${u && u.title ? ` (${u.title})` : ''}: ${msg}`);
    if (!u || typeof u !== 'object') return err('entry must be an object');
    const m = isStr(u.date) && /^(\d{4})-(\d{2})-(\d{2})$/.exec(u.date);
    const real = m && (() => { const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]; })();
    if (!real) err(`date must be a real YYYY-MM-DD, got ${JSON.stringify(u.date)}`);
    if (!(u.target === 'site' || ids.has(u.target))) err(`target must be 'site' or a product id, got ${JSON.stringify(u.target)}`);
    if (!isStr(u.title)) err('title is required');
    if (!isStr(u.text)) err('text is required');
    if (u.url !== undefined && !(isStr(u.url) && isHttp(u.url))) err('url must be an http(s) URL');
    for (const k of Object.keys(u)) if (!known.has(k)) err(`unknown field "${k}" (typo?)`);
    if (i > 0 && isStr(u.date) && isStr(updates[i - 1]?.date) && u.date > updates[i - 1].date) err(`entries must be newest first: ${u.date} comes after ${updates[i - 1].date}`);
  });
  return errors;
}

// ---- CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const url = (f) => path.join(root, f).replace(/\\/g, '/').replace(/^([A-Za-z]):/, 'file:///$1:');
  const { PRODUCTS } = await import(url('src/products.js'));
  const { UPDATES } = await import(url('src/updates.js'));
  const errors = validateProducts(PRODUCTS, { publicDir: path.join(root, 'public') });
  const uErrors = validateUpdates(UPDATES, PRODUCTS);
  if (errors.length) console.error(`✖ products.js has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
  if (uErrors.length) console.error(`✖ updates.js has ${uErrors.length} problem(s):\n  - ${uErrors.join('\n  - ')}`);
  if (errors.length || uErrors.length) process.exit(1);
  console.log(`✔ products.js: ${PRODUCTS.length} records valid (${PRODUCTS.filter((p) => p.status === 'live').length} live)`);
  console.log(`✔ updates.js: ${UPDATES.length} entries valid (latest ${UPDATES[0]?.date})`);
}
