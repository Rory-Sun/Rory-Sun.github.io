// Mobile navigation: hamburger button toggles the link panel below the breakpoint — 800px for the
// Chinese page, 920px for the English one, whose six labels are longer. Keep both numbers in sync
// with the matching @media blocks in src/site.css: if they drift, a menu opened narrow and then
// widened leaves .nav.open and aria-expanded="true" on a hidden button.
// Closes on link click, Escape, outside tap, or when the viewport grows back to desktop width.
import { LANG, t } from './i18n.js';

const BREAKPOINT = LANG === 'en' ? 920 : 800;
const nav = document.querySelector('.nav');
const btn = document.getElementById('nav-toggle');
const menu = document.getElementById('nav-menu');

if (nav && btn && menu) {
  const isOpen = () => nav.classList.contains('open');
  function set(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', t(open ? 'menu.close' : 'menu.open'));
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  }
  btn.addEventListener('click', () => set(!isOpen()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); }
  });
  document.addEventListener('pointerdown', (e) => { if (isOpen() && !nav.contains(e.target)) set(false); });
  matchMedia(`(min-width: ${BREAKPOINT + 1}px)`).addEventListener('change', (e) => { if (e.matches) set(false); });
}
