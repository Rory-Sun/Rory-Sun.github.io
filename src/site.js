// Personal site: observatory console. Renders the mission index, the selected work's screen and
// dossier, and the pipeline coverage matrix from src/products.js; launches in-page demos on demand.

// self-hosted fonts (Google Fonts is unreachable from mainland China); Latin subsets only, CJK
// falls back to the system face
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/chakra-petch/latin-500.css';
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';

import { PRODUCTS } from './products.js';
import './theme.js';
import './nav.js';
import './hud.js';
import './globe.js';

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const live = PRODUCTS.filter((p) => p.status === 'live');
const modesOf = (p) => PRODUCTS.filter((m) => m.parent === p.id && m.url);
// 「地球纪元 · Earth Chronicle」splits into a Chinese name and a Latin name, but 「人体 · 一日」is one
// Chinese name and must stay whole — only split when the part after the dot is Latin
const titleParts = (p) => {
  const [a, b] = p.title.split(' · ');
  return b && /^[A-Za-z]/.test(b) ? [a, b] : [p.title, p.subtitle || ''];
};
const shortTitle = (p) => titleParts(p)[0];
const enTitle = (p) => titleParts(p)[1];

// ---- counters in the hero and section header
const modeCount = PRODUCTS.filter((p) => p.parent).length;
const pad = (n) => String(n).padStart(2, '0');
for (const id of ['target-count', 'targets']) { const el = document.getElementById(id); if (el) el.textContent = pad(live.length); }
const worksTag = document.getElementById('works-tag');
if (worksTag) worksTag.textContent = `${live.length} 个目标 · ${modeCount} 个模式`;

// ---- mission index
const rowsEl = document.getElementById('ix-rows');
rowsEl.innerHTML = live.map((p, i) => `
  <button class="ix-row" type="button" data-i="${i}" aria-pressed="false" aria-controls="screen dossier" style="--accent-raw:${esc(p.accent || '#7cc4ff')}">
    <span class="ix-code"><i aria-hidden="true"></i>${esc(p.code)}</span>
    <span class="ix-name">${esc(shortTitle(p))}<small>${esc(enTitle(p))}</small></span>
    <span class="ix-m c-scale">${esc(p.scale)}</span>
    <span class="c-src">${esc(p.source)}</span>
    <span class="ix-m c-size">${esc(p.size)}</span>
    <span><span class="chip${p.embed ? '' : ' ext'}">${p.embed ? '页内试玩' : '新标签页'}</span></span>
  </button>
  ${modesOf(p).map((m) => `
  <a class="ix-sub" href="${esc(m.url)}" target="_blank" rel="noopener">
    <span class="ix-code">${esc(m.code || '')}</span>
    <span><span class="tree" aria-hidden="true">└</span>模式 · <b>${esc(m.title)}</b> <span class="blurb">— ${esc(m.blurb || m.desc)}</span></span>
    <span class="go">打开 ↗</span>
  </a>`).join('')}
`).join('');
const rowButtons = [...rowsEl.querySelectorAll('.ix-row')];

// ---- screen + dossier for the selected work
const screen = document.getElementById('screen');
const poster = document.getElementById('screen-poster');
const dossier = document.getElementById('dossier');
let current = -1;

function resetScreen() {
  screen.querySelectorAll('iframe, .demo-loading, .screen-close').forEach((el) => el.remove());
  screen.classList.remove('live', 'loading');
}

function select(i, { focusRow = false } = {}) {
  if (i === current) return;
  current = i;
  const p = live[i];
  rowButtons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  if (focusRow) rowButtons[i].focus();
  resetScreen();
  screen.dataset.id = p.id;
  poster.src = p.poster;
  poster.alt = `${shortTitle(p)} 画面`;
  document.getElementById('ov-code').textContent = p.code;
  document.getElementById('ov-scale').textContent = `尺度 ${p.scale}`;

  const hint = (cls, text) => `<p class="demo-hint ${cls}">${esc(text)}</p>`;
  const launch = p.embed
    ? `<button class="btn primary demo-launch" type="button" data-launch="${esc(p.id)}">▶ 启动演示</button>`
      + `<a class="btn primary demo-open-sm" href="${esc(p.url)}" target="_blank" rel="noopener">打开项目 ↗</a>`
      + `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">打开完整版 ↗</a>`
    : `<a class="btn primary" href="${esc(p.url)}" target="_blank" rel="noopener">打开完整版 ↗</a>`;
  const notes = p.embed
    ? hint('demo-hint-lg', p.demoNote || '在本页的画面里直接运行 · 建议使用桌面浏览器') + hint('demo-hint-sm', '手机屏幕放不下这个界面 · 在新标签页全屏体验')
    : hint('', p.demoNote || '在新标签页打开');

  dossier.innerHTML = `
    <div class="dossier-label">${esc(p.code)} · ${esc(p.kicker || '')}</div>
    <h3>${esc(shortTitle(p))}<small>${esc(enTitle(p))}</small></h3>
    <p class="dossier-desc">${esc(p.desc)}</p>
    ${p.specs ? `<dl class="spec">${p.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
    ${p.features ? `<ul class="feats">${p.features.map((f) => `<li><b>${esc(f.title)}</b>${esc(f.text)}</li>`).join('')}</ul>` : ''}
    <div class="actions">${launch}</div>
    ${notes}`;
}

rowsEl.addEventListener('click', (e) => {
  const row = e.target.closest('.ix-row');
  if (row) select(+row.dataset.i);
});
// arrow keys move the selection through the index like a list
rowsEl.addEventListener('keydown', (e) => {
  const row = e.target.closest('.ix-row');
  if (!row || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const i = +row.dataset.i, n = rowButtons.length;
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
  select(next, { focusRow: true });
});

// ---- in-page demo inside the screen
function launchDemo(id) {
  const p = live.find((x) => x.id === id);
  if (!p || !p.embed) return;
  if (screen.dataset.id !== id) select(live.indexOf(p));
  if (screen.classList.contains('live') || screen.classList.contains('loading')) return;
  // spinner over the dimmed poster until the iframe loads; after a while also offer the full
  // version in case the embed is blocked or slow
  const status = document.createElement('div');
  status.className = 'demo-loading';
  status.setAttribute('role', 'status');
  status.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>正在载入 ${esc(shortTitle(p))}…</span><a href="${esc(p.url)}" target="_blank" rel="noopener">加载太慢？在新标签页打开 ↗</a>`;
  screen.appendChild(status);
  screen.classList.add('loading');
  const slow = setTimeout(() => status.classList.add('slow'), 6000);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'screen-close';
  close.textContent = '✕ 关闭演示';
  close.addEventListener('click', () => { resetScreen(); dossier.querySelector('[data-launch]')?.focus(); });

  const iframe = document.createElement('iframe');
  iframe.src = p.embed;
  iframe.title = `${shortTitle(p)} 交互演示`;
  iframe.allow = 'fullscreen; autoplay';
  iframe.addEventListener('load', () => {
    clearTimeout(slow);
    screen.classList.remove('loading');
    screen.classList.add('live');
    status.remove();
    screen.appendChild(close);
    // the launch button keeps existing, but move focus into the demo the user just asked for
    iframe.focus({ preventScroll: true });
  });
  screen.appendChild(iframe);
  screen.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
dossier.addEventListener('click', (e) => {
  const b = e.target.closest('[data-launch]');
  if (b) launchDemo(b.dataset.launch);
});

// initial selection: #<product-id> or #demo-<product-id> deep links still work
const hash = location.hash.slice(1);
const fromHash = live.findIndex((p) => p.id === hash || `demo-${p.id}` === hash);
select(fromHash >= 0 ? fromHash : 0);
if (fromHash >= 0) {
  document.getElementById('works').scrollIntoView();
  if (hash.startsWith('demo-')) launchDemo(live[fromHash].id);
}

// ---- pipeline coverage matrix
const mark = (v) => `<span class="dot ${['off', 'part', 'on'][v ?? 0]}" role="img" aria-label="${['未使用', '部分使用', '核心环节'][v ?? 0]}"></span>`;
document.getElementById('matrix-body').innerHTML = live.filter((p) => p.stages).map((p) => `
  <tr><td>${esc(shortTitle(p))}</td><td>${mark(p.stages.data)}</td><td>${mark(p.stages.blender)}</td><td>${mark(p.stages.realtime)}</td><td>${mark(p.stages.story)}</td></tr>`).join('');
