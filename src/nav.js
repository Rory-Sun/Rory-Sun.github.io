// Mobile navigation: hamburger button toggles the link panel below 960px.
// Closes on link click, Escape, outside tap, or when the viewport grows back to desktop width.
const nav = document.querySelector('.nav');
const btn = document.getElementById('nav-toggle');
const menu = document.getElementById('nav-menu');

if (nav && btn && menu) {
  const isOpen = () => nav.classList.contains('open');
  function set(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  }
  btn.addEventListener('click', () => set(!isOpen()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); }
  });
  document.addEventListener('pointerdown', (e) => { if (isOpen() && !nav.contains(e.target)) set(false); });
  matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}
