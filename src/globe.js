// Hero globe: a real-time Three.js Earth with custom GLSL (day/night terminator, city lights,
// ocean specular, atmospheric rim). Loads lazily after first paint; the static poster image stays
// as the fallback when WebGL is unavailable or until textures are ready.
const orb = document.querySelector('.orb');
const canvas = document.getElementById('globe');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uSun);
    float ndl = dot(N, L);
    float day = smoothstep(-0.12, 0.25, ndl);

    vec3 dayCol = texture2D(uDay, vUv).rgb;
    vec3 lights = texture2D(uNight, vUv).rgb;

    // diffuse with a soft ambient floor so the night side is not pure black
    vec3 col = dayCol * (0.035 + 0.95 * max(ndl, 0.0));

    // warm twilight band along the terminator
    float twilight = smoothstep(-0.18, 0.04, ndl) * (1.0 - smoothstep(0.04, 0.32, ndl));
    col += dayCol * vec3(0.9, 0.45, 0.2) * twilight * 0.35;

    // city lights on the night side
    col += lights * vec3(1.0, 0.86, 0.62) * (1.0 - day) * 1.5;

    // ocean specular: oceans are the bluish pixels of the color map
    float ocean = smoothstep(0.02, 0.14, dayCol.b - max(dayCol.r, dayCol.g));
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 60.0) * ocean * 0.55 * day;
    col += vec3(1.0, 0.95, 0.85) * spec;

    // thin atmospheric rim on the lit limb
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.2);
    col += vec3(0.35, 0.6, 1.0) * rim * (0.25 + 0.75 * day) * 0.9;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uSun;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float f = dot(N, V);                       // 1 at disc centre, 0 at the outer edge of the shell
    float inner = smoothstep(0.85, 0.36, f);   // fade out over the planet disc
    float outer = smoothstep(0.0, 0.36, f);    // fade out towards space
    float lit = 0.3 + 0.7 * smoothstep(-0.35, 0.45, dot(N, normalize(uSun)));
    float a = inner * outer * lit;
    gl_FragColor = vec4(vec3(0.42, 0.66, 1.0) * a * 0.85, a);
    #include <colorspace_fragment>
  }`;

async function start() {
  if (!orb || !canvas) return;
  let THREE;
  try {
    THREE = await import('three');
  } catch { return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 4.4);

  const loader = new THREE.TextureLoader();
  let day, night;
  try {
    [day, night] = await Promise.all([loader.loadAsync('/site/earth_color_2k.webp'), loader.loadAsync('/site/earth_lights_2k.webp')]);
  } catch { renderer.dispose(); return; }
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  for (const t of [day, night]) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; }

  const sun = new THREE.Vector3(1.6, 0.45, 1.0).normalize();
  const tilt = new THREE.Group();
  tilt.rotation.z = -0.41;               // 23.4 degree axial tilt
  tilt.rotation.x = 0.28;                // look slightly down onto the northern hemisphere
  scene.add(tilt);

  const spin = new THREE.Group();        // rotates about the (tilted) polar axis
  tilt.add(spin);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 96),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: EARTH_FRAG, uniforms: { uDay: { value: day }, uNight: { value: night }, uSun: { value: sun } } }),
  );
  spin.add(earth);

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.085, 96, 96),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: ATMO_FRAG, uniforms: { uSun: { value: sun } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  atmo.renderOrder = 1;
  scene.add(atmo);

  // ---- sizing
  let needsRender = true;
  function resize() {
    const r = orb.getBoundingClientRect();
    const s = Math.max(1, Math.round(Math.min(r.width, r.height)));
    renderer.setSize(s, s, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  new ResizeObserver(resize).observe(orb);

  // ---- interaction: drag to rotate, with inertia
  let dragging = false, lastX = 0, lastY = 0, velX = 0, velY = 0, pitch = 0;
  const autoSpeed = () => (reduceMotion.matches ? 0 : 0.07);   // rad/s
  orb.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY; velX = velY = 0;
    orb.setPointerCapture(e.pointerId);
  });
  orb.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    velX = dx * 0.006; velY = dy * 0.004;
    spin.rotation.y += velX;
    pitch = Math.max(-0.7, Math.min(0.7, pitch + velY));
    needsRender = true;
  });
  const release = () => { dragging = false; };
  orb.addEventListener('pointerup', release);
  orb.addEventListener('pointercancel', release);
  orb.addEventListener('lostpointercapture', release);

  // ---- render loop: only while visible, and only when something changed
  let visible = true, last = performance.now(), raf = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); loop(); } }, { threshold: 0.05 }).observe(orb);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); loop(); } });

  function loop() {
    cancelAnimationFrame(raf);
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (!dragging) {
      spin.rotation.y += autoSpeed() * dt + velX;
      pitch = Math.max(-0.7, Math.min(0.7, pitch + velY));
      velX *= 0.92; velY *= 0.9;
      if (Math.abs(velX) < 1e-4) velX = 0;
      if (Math.abs(velY) < 1e-4) velY = 0;
      if (autoSpeed() || velX || velY) needsRender = true;
    }
    // ease the user's pitch on top of the base viewing angle
    const targetX = 0.28 + pitch;
    if (Math.abs(tilt.rotation.x - targetX) > 1e-4) { tilt.rotation.x += (targetX - tilt.rotation.x) * 0.15; needsRender = true; }

    if (!needsRender) return;
    needsRender = false;
    renderer.render(scene, camera);
  }

  resize();
  renderer.render(scene, camera);
  orb.classList.add('ready');
  loop();
}

// Defer until the browser is idle so the hero text paints first.
if ('requestIdleCallback' in window) requestIdleCallback(() => start(), { timeout: 1500 });
else setTimeout(start, 200);
