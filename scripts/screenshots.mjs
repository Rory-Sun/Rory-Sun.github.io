// Screenshots of the built site (dist/) at desktop, tablet and mobile widths.
// Serves dist/ on a local port, waits for the hero globe to finish loading, writes screenshots/*.png.
//   npm run build && npm run screenshots
// Requires a Playwright browser: npx playwright install chromium
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const out = path.join(root, 'screenshots');
if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found - run `npm run build` first');
  process.exit(1);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(dist, url.endsWith('/') ? url + 'index.html' : url);
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
try {
  for (const vp of VIEWPORTS) {
    for (const theme of ['dark', 'light']) {
      const { name, ...viewport } = vp;
      const ctx = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch, deviceScaleFactor: viewport.deviceScaleFactor || 1, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.addInitScript((t) => { try { localStorage.setItem('rory-theme', t); } catch {} }, theme);
      await page.goto(base, { waitUntil: 'networkidle' });
      // wait for the WebGL globe (or give up after a few seconds if the runner has no GL)
      await page.waitForSelector('.orb.ready', { timeout: 8000 }).catch(() => console.warn(`  [${name}/${theme}] globe did not become ready; capturing poster fallback`));
      // in reduced-motion mode every .reveal is visible, so a full-page capture shows the whole site
      const file = path.join(out, `${name}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`✔ ${path.relative(root, file)} (${viewport.width}x${viewport.height}, ${theme})`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
