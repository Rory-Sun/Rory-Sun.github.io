// Animated starfield background. Pauses while the tab is hidden or the light theme is active,
// and renders a single static frame when the user prefers reduced motion.
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let stars = [];

function resize() {
  canvas.width = window.innerWidth * Math.min(devicePixelRatio, 2);
  canvas.height = window.innerHeight * Math.min(devicePixelRatio, 2);
  const n = Math.round((canvas.width * canvas.height) / 9000);
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.3, a: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2,
    c: Math.random() < 0.15 ? '255,214,170' : Math.random() < 0.3 ? '190,215,255' : '235,240,255',
  }));
  frame(0);
}

let t = 0;
function frame(dt) {
  t += dt;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const g = ctx.createRadialGradient(canvas.width * 0.7, canvas.height * 0.2, 0, canvas.width * 0.7, canvas.height * 0.2, canvas.width * 0.8);
  g.addColorStop(0, 'rgba(30,60,120,0.35)');
  g.addColorStop(1, 'rgba(4,7,15,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    const tw = 0.55 + 0.45 * Math.sin(t * s.s + s.a);
    ctx.fillStyle = `rgba(${s.c},${(0.35 + 0.65 * tw).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.8 + 0.4 * tw), 0, Math.PI * 2); ctx.fill();
  }
}

const active = () => !document.hidden && root.dataset.theme !== 'light' && !reduceMotion.matches;
let raf = 0;
function loop() {
  cancelAnimationFrame(raf);
  if (!active()) return;
  raf = requestAnimationFrame(loop);
  frame(0.016);
}

resize();
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', loop);
reduceMotion.addEventListener?.('change', loop);
new MutationObserver(loop).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
loop();
