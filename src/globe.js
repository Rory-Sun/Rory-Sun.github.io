// Hero globe: a real-time Three.js Earth with custom GLSL (day/night terminator, city lights,
// drifting clouds with shadows, ocean glint, a thin atmospheric limb). Loads lazily after first
// paint; the static poster image stays as the fallback when WebGL is unavailable or until textures
// are ready. The cloud map arrives after the globe is already showing and fades in.
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
  uniform sampler2D uClouds;
  uniform vec3 uSun;
  uniform float uCloudShift;   // clouds drift slowly over the ground (offset in u)
  uniform float uCloudMix;     // 0 until the cloud map has loaded, then eased to 1
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

    // oceans are the bluish pixels of the colour map. Blue Marble water is nearly black, which
    // reads as a hole beside the lit land, so lift it slightly.
    float ocean = smoothstep(0.02, 0.14, dayCol.b - max(dayCol.r, dayCol.g));
    dayCol += vec3(0.010, 0.040, 0.085) * ocean;

    vec2 cuv = vec2(vUv.x + uCloudShift, vUv.y);
    float cloud = smoothstep(0.2, 0.95, texture2D(uClouds, cuv).r) * uCloudMix;   // thinned: the continents must stay readable
    float cloudShadow = smoothstep(0.2, 0.95, texture2D(uClouds, cuv + vec2(0.004, 0.0)).r) * uCloudMix;

    // diffuse with a soft ambient floor so the night side is not pure black
    vec3 col = dayCol * (0.035 + 1.3 * max(ndl, 0.0));
    col *= 1.0 - 0.32 * cloudShadow * day;

    // warm twilight band along the terminator
    float twilight = smoothstep(-0.18, 0.04, ndl) * (1.0 - smoothstep(0.04, 0.32, ndl));
    col += dayCol * vec3(0.9, 0.45, 0.2) * twilight * 0.35;

    // city lights on the night side, dimmed under cloud
    col += lights * vec3(1.0, 0.86, 0.62) * (1.0 - day) * 1.5 * (1.0 - 0.7 * cloud);

    // sun glint on open water: a tight core plus a faint wide sheen. A single broad lobe used to
    // paint a white patch over whole seas.
    vec3 H = normalize(L + V);
    float nh = max(dot(N, H), 0.0);
    float spec = (pow(nh, 240.0) * 0.45 + pow(nh, 26.0) * 0.045) * ocean * day * (1.0 - cloud);
    col += vec3(1.0, 0.93, 0.82) * spec;

    // clouds: lit by the sun, warm at the terminator, almost invisible at night
    vec3 cloudCol = vec3(0.03 + 0.98 * max(ndl, 0.0)) + vec3(0.9, 0.55, 0.3) * twilight * 0.16;
    col = mix(col, cloudCol, cloud * 0.86);

    // thin blue limb where the line of sight grazes the air
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.6);
    col += vec3(0.30, 0.55, 1.0) * rim * (0.06 + 0.94 * day) * 0.26;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

// The shell is 6% larger than the planet, so the planet's edge sits at dot(N, V) = 0.33 on it.
const ATMO_FRAG = /* glsl */ `
  uniform vec3 uSun;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float f = dot(N, V);                       // 1 at disc centre, 0 at the outer edge of the shell
    float outer = smoothstep(0.0, 0.33, f);    // fade out towards space
    float inner = smoothstep(0.52, 0.33, f);   // fade out over the planet disc (its outer ~8%)
    float lit = 0.05 + 0.95 * smoothstep(-0.3, 0.5, dot(N, normalize(uSun)));
    float a = inner * outer * outer * lit;
    gl_FragColor = vec4(vec3(0.34, 0.6, 1.0) * a * 0.62, a);
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
    // preserveDrawingBuffer keeps the last frame readable after compositing. Without it the canvas
    // reads back empty whenever a capture lands between renders - which is exactly what happens once
    // the render loop has paused off-screen, and it silently blanked the globe in every screenshot.
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: true });
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

  // clouds start as a 1x1 black texture (no cloud) and are swapped in once the real map has loaded
  const noClouds = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  noClouds.needsUpdate = true;
  const earthUniforms = { uDay: { value: day }, uNight: { value: night }, uClouds: { value: noClouds }, uSun: { value: sun }, uCloudShift: { value: 0 }, uCloudMix: { value: 0 } };
  let cloudsReady = false;

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 96),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: EARTH_FRAG, uniforms: earthUniforms }),
  );
  spin.add(earth);

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 96, 96),
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
    // resizing clears the buffer; paint immediately so it is never left empty while the loop is idle
    renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(orb);

  // A lost GL context (driver reset, tab backgrounded for a long time) would otherwise leave a hole:
  // the poster has already faded out and nothing repaints it. Fall back to the poster, then recover.
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); orb.classList.remove('ready'); });
  canvas.addEventListener('webglcontextrestored', () => { resize(); orb.classList.add('ready'); });

  // ---- interaction: drag to rotate, with inertia
  let dragging = false, lastX = 0, lastY = 0, velX = 0, velY = 0, pitch = 0;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
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
    spin.rotation.y += dx * 0.006;
    pitch = Math.max(-0.7, Math.min(0.7, pitch + dy * 0.004));
    // smoothed, capped release velocity (per frame) so a single large move can't spin the globe wildly
    velX = clamp(0.6 * velX + 0.4 * dx * 0.006, -0.08, 0.08);
    velY = clamp(0.6 * velY + 0.4 * dy * 0.004, -0.05, 0.05);
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
    if (cloudsReady) {
      const u = earthUniforms;
      if (u.uCloudMix.value < 1) { u.uCloudMix.value = Math.min(1, u.uCloudMix.value + dt / 1.4); needsRender = true; }
      if (autoSpeed()) u.uCloudShift.value = (u.uCloudShift.value + dt * 0.0035) % 1;   // weather drifts east
    }
    // ease the user's pitch on top of the base viewing angle
    const targetX = 0.28 + pitch;
    if (Math.abs(tilt.rotation.x - targetX) > 1e-4) { tilt.rotation.x += (targetX - tilt.rotation.x) * 0.15; needsRender = true; }

    if (!needsRender) return;
    needsRender = false;
    renderer.render(scene, camera);
    showTheta(now);
  }

  // the reticle's θ readout reports the real spin of the mesh, refreshed ~8 times a second
  const thetaEl = document.getElementById('theta');
  let thetaAt = 0;
  function showTheta(now = performance.now(), force = false) {
    if (!thetaEl || (!force && now - thetaAt < 120)) return;
    thetaAt = now;
    const deg = (((spin.rotation.y * 180) / Math.PI) % 360 + 360) % 360;
    thetaEl.textContent = `${deg.toFixed(1).padStart(5, '0')}°`;
  }

  resize();
  renderer.render(scene, camera);
  showTheta(performance.now(), true);
  orb.classList.add('ready');
  loop();

  // the cloud map is the least essential texture, so it never delays the globe
  loader.loadAsync('/site/earth_clouds_1280.webp').then((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = aniso; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
    earthUniforms.uClouds.value = tex;
    cloudsReady = true;
    orb.classList.add('clouds');   // lets the screenshot script wait for the finished picture
    if (reduceMotion.matches) earthUniforms.uCloudMix.value = 1;
    needsRender = true;
    if (!raf || reduceMotion.matches) renderer.render(scene, camera);
  }).catch(() => {});
}

// Defer until the browser is idle so the hero text paints first.
if ('requestIdleCallback' in window) requestIdleCallback(() => start(), { timeout: 1500 });
else setTimeout(start, 200);
