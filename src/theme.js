// Light/dark theme toggle. The chosen theme is applied before first paint by the inline script in
// index.html; this module wires the button and animates the switch with the View Transitions API.
const KEY = 'rory-theme';
const root = document.documentElement;
const btn = document.getElementById('theme-toggle');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function label() {
  const light = root.dataset.theme === 'light';
  btn.setAttribute('aria-label', light ? '切换到深色模式' : '切换到浅色模式');
  btn.title = btn.getAttribute('aria-label');
}

function apply(theme) {
  root.dataset.theme = theme;
  try { localStorage.setItem(KEY, theme); } catch {}
  label();
}

btn?.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  if (!document.startViewTransition || reduceMotion.matches) { apply(next); return; }
  // circular reveal that grows from the button
  const r = btn.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-r', `${radius}px`);
  // the theme is applied synchronously inside the callback; if the browser aborts or times out the
  // visual transition (hidden tab, heavy frame), that is cosmetic only, so swallow the rejection
  const vt = document.startViewTransition(() => apply(next));
  for (const p of [vt.ready, vt.finished, vt.updateCallbackDone]) p.catch(() => {});
});

if (btn) label();
