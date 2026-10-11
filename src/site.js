// Personal site: observatory console. Renders the mission index, the selected work's screen,
// dossier and technical breakdown, the pipeline coverage matrix and the log from src/products.js and
// src/updates.js; launches in-page demos on demand. All visible text comes from src/i18n.js (t) or
// from the records' own `en` fields (loc), so the same script serves / and /en/.

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
import { UPDATES } from './updates.js';
import { LANG, t, loc } from './i18n.js';
import './theme.js';
import './nav.js';
import './hud.js';
import './globe.js';

const EN = LANG === 'en';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const live = PRODUCTS.filter((p) => p.status === 'live');
const modesOf = (p) => PRODUCTS.filter((m) => m.parent === p.id && m.url);

// Names. Chinese page: 「地球纪元」with the Latin name as a caption. English page: the English name with
// the Chinese name as the caption. 「人体 · 一日」is one Chinese name and must stay whole, so the zh title
// is only split when the part after the dot is Latin.
const zhName = (p) => { const [a, b] = p.title.split(' · '); return b && /^[A-Za-z]/.test(b) ? a : p.title; };
const zhLatin = (p) => { const [, b] = p.title.split(' · '); return b && /^[A-Za-z]/.test(b) ? b : p.subtitle || ''; };
const nameOf = (p) => (EN ? loc(p, 'title') : zhName(p));
const altName = (p) => (EN ? zhName(p) : zhLatin(p));
const altLang = EN ? 'zh-CN' : 'en';

// ---- counters in the hero and section header
const modeCount = PRODUCTS.filter((p) => p.parent).length;
const pad = (n) => String(n).padStart(2, '0');
for (const id of ['target-count', 'targets']) { const el = document.getElementById(id); if (el) el.textContent = pad(live.length); }
document.getElementById('works-tag').textContent = t('js.worksTag', { n: live.length, m: modeCount });

// ---- mission index
const rowsEl = document.getElementById('ix-rows');
rowsEl.innerHTML = live.map((p, i) => `
  <button class="ix-row" type="button" data-i="${i}" aria-pressed="false" aria-controls="screen dossier" style="--accent-raw:${esc(p.accent || '#7cc4ff')}">
    <span class="ix-code"><i aria-hidden="true"></i>${esc(p.code)}</span>
    <span class="ix-name">${esc(nameOf(p))}<small lang="${altLang}">${esc(altName(p))}</small></span>
    <span class="ix-m c-scale">${esc(loc(p, 'scale'))}</span>
    <span class="c-src">${esc(loc(p, 'source'))}</span>
    <span class="ix-m c-size">${esc(loc(p, 'size'))}</span>
    <span><span class="chip${p.embed ? '' : ' ext'}">${t(p.embed ? 'js.chip.embed' : 'js.chip.ext')}</span></span>
  </button>
  ${modesOf(p).map((m) => `
  <a class="ix-sub" href="${esc(m.url)}" target="_blank" rel="noopener">
    <span class="ix-code">${esc(m.code || '')}</span>
    <span><span class="tree" aria-hidden="true">└</span>${t('js.mode')} · <b>${esc(loc(m, 'title'))}</b> <span class="blurb">— ${esc(loc(m, 'blurb') || loc(m, 'desc'))}</span></span>
    <span class="go">${t('js.open')}</span>
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
  poster.alt = t('js.posterAlt', { name: nameOf(p) });
  document.getElementById('ov-code').textContent = p.code;
  document.getElementById('ov-scale').textContent = t('js.scale', { v: loc(p, 'scale') });

  const hint = (cls, text) => `<p class="demo-hint ${cls}">${esc(text)}</p>`;
  const launch = p.embed
    ? `<button class="btn primary demo-launch" type="button" data-launch="${esc(p.id)}">${t('js.launch')}</button>`
      + `<a class="btn primary demo-open-sm" href="${esc(p.url)}" target="_blank" rel="noopener">${t('js.openProject')}</a>`
      + `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">${t('js.openFull')}</a>`
    : `<a class="btn primary" href="${esc(p.url)}" target="_blank" rel="noopener">${t('js.openFull')}</a>`;
  const note = loc(p, 'demoNote');
  const notes = p.embed
    ? hint('demo-hint-lg', note || t('js.hintEmbed')) + hint('demo-hint-sm', t('js.hintPhone'))
    : hint('', note || t('js.hintNewTab'));
  const specs = loc(p, 'specs');
  const feats = loc(p, 'features');

  dossier.innerHTML = `
    <div class="dossier-label">${esc(p.code)} · ${esc(loc(p, 'kicker') || '')}</div>
    <h3>${esc(nameOf(p))}<small lang="${altLang}">${esc(altName(p))}</small></h3>
    <p class="dossier-desc">${esc(loc(p, 'desc'))}</p>
    ${specs ? `<dl class="spec">${specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
    ${feats ? `<ul class="feats">${feats.map((f) => `<li><b>${esc(f.title)}</b>${esc(f.text)}</li>`).join('')}</ul>` : ''}
    <div class="actions">${launch}</div>
    ${notes}`;
  renderBreakdown(p);
}

// ---- technical breakdown of the selected work: key numbers, then problem / approach / trade-off
const breakdownEl = document.getElementById('breakdown');
function renderBreakdown(p) {
  const b = loc(p, 'breakdown');
  breakdownEl.hidden = !b;
  if (!b) { breakdownEl.innerHTML = ''; return; }
  breakdownEl.innerHTML = `
    <div class="bd-head"><h3>${t('js.breakdown')}</h3><span class="bd-code">${esc(p.code)} · ${esc(nameOf(p))}</span></div>
    <ul class="bd-metrics">${b.metrics.map(([v, l]) => `<li><b>${esc(v)}</b><span>${esc(l)}</span></li>`).join('')}</ul>
    <div class="bd-grid">${b.decisions.map((d) => `
      <article class="bd-card frame">
        <h4>${esc(d.title)}</h4>
        <dl>
          <div class="bd-row bd-problem"><dt>${t('js.problem')}</dt><dd>${esc(d.problem)}</dd></div>
          <div class="bd-row bd-approach"><dt>${t('js.approach')}</dt><dd>${esc(d.approach)}</dd></div>
          <div class="bd-row bd-tradeoff"><dt>${t('js.tradeoff')}</dt><dd>${esc(d.tradeoff)}</dd></div>
        </dl>
      </article>`).join('')}</div>
    ${b.boundary ? `<p class="bd-boundary"><span>${t('js.boundary')}</span>${esc(b.boundary)}</p>` : ''}`;
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
  status.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>${esc(t('js.loading', { name: nameOf(p) }))}</span><a href="${esc(p.url)}" target="_blank" rel="noopener">${t('js.slow')}</a>`;
  screen.appendChild(status);
  screen.classList.add('loading');
  const slow = setTimeout(() => status.classList.add('slow'), 6000);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'screen-close';
  close.textContent = t('js.close');
  close.addEventListener('click', () => { resetScreen(); dossier.querySelector('[data-launch]')?.focus(); });

  const iframe = document.createElement('iframe');
  iframe.src = p.embed;
  iframe.title = t('js.iframeTitle', { name: nameOf(p) });
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

// #<product-id> and #demo-<product-id> deep links select that work. Handled on load AND on
// hashchange: a same-page link or the back button only changes the hash, it does not reload.
function selectFromHash({ initial = false } = {}) {
  const hash = location.hash.slice(1);
  const i = live.findIndex((p) => p.id === hash || `demo-${p.id}` === hash);
  if (i < 0) { if (initial) select(0); return; }
  select(i);
  document.getElementById('works').scrollIntoView();
  if (hash.startsWith('demo-')) launchDemo(live[i].id);
}
selectFromHash({ initial: true });
addEventListener('hashchange', () => selectFromHash());

// ---- language switch: carry the reader's place across. The link goes to the other language's
// page; on the way, keep the current hash, or the selected work if it isn't the default one.
const langSwitch = document.getElementById('lang-switch');
langSwitch?.addEventListener('click', (e) => {
  const base = langSwitch.getAttribute('href').split('#')[0];
  const hash = location.hash || (current > 0 ? `#${live[current].id}` : '');
  if (!hash) return;
  e.preventDefault();
  location.assign(base + hash);
});

// ---- pipeline coverage matrix
const markKey = ['legend.off', 'legend.part', 'legend.on'];
const mark = (v) => `<span class="dot ${['off', 'part', 'on'][v ?? 0]}" role="img" aria-label="${esc(t(markKey[v ?? 0]))}"></span>`;
document.getElementById('matrix-body').innerHTML = live.filter((p) => p.stages).map((p) => `
  <tr><td>${esc(nameOf(p))}</td><td>${mark(p.stages.data)}</td><td>${mark(p.stages.blender)}</td><td>${mark(p.stages.realtime)}</td><td>${mark(p.stages.story)}</td></tr>`).join('');

// ---- log: newest first, filterable by work, the oldest entries folded behind a button
const LOG_FOLD = 6;
const logList = document.getElementById('log-list');
const logMore = document.getElementById('log-more');
const logFilter = document.getElementById('log-filter');
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const targetLabel = (tg) => (tg === 'site'
  ? { code: 'SYS', name: t('js.site'), accent: '' }
  : { code: byId[tg]?.code || '', name: byId[tg] ? nameOf(byId[tg]) : tg, accent: byId[tg]?.accent || '' });
let logTarget = 'all', logExpanded = false;

document.getElementById('log-count').textContent = t('js.logCount', { n: UPDATES.length });
const lastSync = document.getElementById('last-sync');
if (lastSync && UPDATES[0]) { lastSync.dateTime = UPDATES[0].date; lastSync.textContent = UPDATES[0].date.slice(5); }

const targets = ['all', 'site', ...live.map((p) => p.id)].filter((tg) => tg === 'all' || UPDATES.some((u) => u.target === tg));
logFilter.innerHTML = targets.map((tg) => {
  const n = tg === 'all' ? UPDATES.length : UPDATES.filter((u) => u.target === tg).length;
  const label = tg === 'all' ? t('js.all') : targetLabel(tg).name;
  return `<button type="button" class="log-chip" data-target="${tg}" aria-pressed="${tg === 'all'}">${esc(label)} <span>${n}</span></button>`;
}).join('');

function renderLog() {
  const items = UPDATES.filter((u) => logTarget === 'all' || u.target === logTarget);
  const fold = logTarget === 'all' && !logExpanded && items.length > LOG_FOLD;
  const shown = fold ? items.slice(0, LOG_FOLD) : items;
  logList.innerHTML = shown.map((u, i) => {
    const tg = targetLabel(u.target);
    const title = loc(u, 'title'), url = loc(u, 'url');
    const sameDay = i > 0 && shown[i - 1].date === u.date;
    return `<li class="log-row${sameDay ? ' same-day' : ''}">
      <time class="log-date" datetime="${u.date}">${u.date}</time>
      <span class="log-tgt"${tg.accent ? ` style="--accent-raw:${esc(tg.accent)}"` : ''}><i aria-hidden="true"></i>${esc(tg.code)} · ${esc(tg.name)}</span>
      <div class="log-body"><b>${esc(title)}</b><p>${esc(loc(u, 'text'))}</p></div>
      ${url ? `<a class="log-go" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(t('js.viewAria', { name: tg.name, title }))}">${t('js.view')}</a>` : '<span></span>'}
    </li>`;
  }).join('');
  const hidden = items.length - shown.length;
  logMore.hidden = !(logTarget === 'all' && items.length > LOG_FOLD);
  logMore.textContent = fold ? t('js.more', { n: hidden }) : t('js.less');
  logMore.setAttribute('aria-expanded', String(!fold));
}
logFilter.addEventListener('click', (e) => {
  const b = e.target.closest('.log-chip');
  if (!b) return;
  logTarget = b.dataset.target;
  logFilter.querySelectorAll('.log-chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
  renderLog();
});
logMore.addEventListener('click', () => {
  logExpanded = !logExpanded;
  renderLog();
  if (!logExpanded) document.getElementById('log').scrollIntoView({ block: 'start' });
});
renderLog();
