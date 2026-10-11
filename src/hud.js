// Edge telemetry and reticle: decorative live readouts around the page (local time in Suzhou,
// viewport size, current section, scroll progress) and the tick ring around the hero globe.
// Everything here is aria-hidden in the markup; it adds atmosphere, never information.

// reticle tick ring: every 5 degrees, longer every 30
const ticks = document.getElementById('ret-ticks');
if (ticks) {
  let svg = '';
  for (let a = 0; a < 360; a += 5) {
    const long = a % 30 === 0, r1 = 186, r2 = long ? 175 : 181, rad = (a - 90) * Math.PI / 180;
    const p = (r) => `${(200 + r * Math.cos(rad)).toFixed(2)} ${(200 + r * Math.sin(rad)).toFixed(2)}`;
    svg += `<path d="M${p(r1)} L${p(r2)}" opacity="${long ? 1 : 0.45}"/>`;
  }
  ticks.innerHTML = svg;
}

// local time in Suzhou
const clock = document.getElementById('clock');
if (clock) {
  const fmt = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => {
    const now = new Date();
    clock.textContent = fmt.format(now);
    clock.dateTime = now.toISOString();
  };
  tick();
  setInterval(tick, 1000);
}

// viewport size
const vp = document.getElementById('vp');
if (vp) {
  const set = () => { vp.textContent = `${innerWidth}×${innerHeight}`; };
  set();
  addEventListener('resize', set, { passive: true });
}

// current section + scroll progress, updated at most once per frame
const scrollEl = document.getElementById('scroll');
const sectorEl = document.getElementById('sector');
const sections = [...document.querySelectorAll('[data-sector]')];
if (scrollEl && sectorEl && sections.length) {
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollEl.textContent = String(Math.round((100 * scrollY) / Math.max(1, max))).padStart(3, '0');
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s;
    sectorEl.textContent = current.dataset.sector;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}
