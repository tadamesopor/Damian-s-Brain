(function () {
  'use strict';

  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ── Renderer ───────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  function setSize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ── Scene & Camera ─────────────────────────
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 5.5;

  setSize();

  // ── Lights ─────────────────────────────────
  scene.add(new THREE.AmbientLight(0xf0ebe3, 0.25));

  const violet = new THREE.PointLight(0x7b4fff, 3.5, 18);
  violet.position.set(2, 2, 3);
  scene.add(violet);

  const warm = new THREE.PointLight(0xf0ebe3, 0.9, 14);
  warm.position.set(-3, 1.5, 2);
  scene.add(warm);

  const rimLight = new THREE.PointLight(0x7b4fff, 1.2, 12);
  rimLight.position.set(0, -3, 1);
  scene.add(rimLight);

  // ── Group for mouse parallax ───────────────
  const group = new THREE.Group();
  scene.add(group);

  // ─────────────────────────────────────────
  //  VINYL DISC
  // ─────────────────────────────────────────
  const vinylGroup = new THREE.Group();

  // Body of the record
  const bodyGeo  = new THREE.CylinderGeometry(1.1, 1.1, 0.055, 72);
  const bodyMat  = new THREE.MeshPhongMaterial({
    color: 0x111111, shininess: 160, specular: new THREE.Color(0x7b4fff)
  });
  vinylGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Groove rings
  for (let i = 0; i < 10; i++) {
    const r = 0.28 + i * 0.075;
    const ringGeo = new THREE.TorusGeometry(r, 0.0022, 6, 72);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.14 + i * 0.01, 0.14 + i * 0.01, 0.14 + i * 0.01)
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    vinylGroup.add(ring);
  }

  // Centre label
  const labelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.065, 40);
  const labelMat = new THREE.MeshPhongMaterial({
    color: 0x7b4fff, shininess: 220, specular: new THREE.Color(0xffffff)
  });
  vinylGroup.add(new THREE.Mesh(labelGeo, labelMat));

  // Spindle hole
  const holeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.08, 24);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
  vinylGroup.add(new THREE.Mesh(holeGeo, holeMat));

  vinylGroup.position.set(-2.0, 0.65, -0.8);
  vinylGroup.rotation.x = 0.38;
  vinylGroup.rotation.z = -0.12;
  group.add(vinylGroup);

  // ─────────────────────────────────────────
  //  WATER SPHERE
  // ─────────────────────────────────────────
  const sphereGeo = new THREE.SphereGeometry(0.88, 80, 80);

  // Store original positions for wobble
  const origPos = Float32Array.from(sphereGeo.attributes.position.array);

  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0x060614,
    shininess: 200,
    specular: new THREE.Color(0x7b4fff),
    transparent: true,
    opacity: 0.88
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(2.05, -0.45, -0.4);
  group.add(sphere);

  // Wireframe overlay
  const wireGeo = new THREE.SphereGeometry(0.915, 22, 22);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x7b4fff, wireframe: true, transparent: true, opacity: 0.065
  });
  const wireSphere = new THREE.Mesh(wireGeo, wireMat);
  wireSphere.position.copy(sphere.position);
  group.add(wireSphere);

  // ─────────────────────────────────────────
  //  FLOATING PARTICLES
  // ─────────────────────────────────────────
  const COUNT = 260;
  const pPos  = new Float32Array(COUNT * 3);
  const pSeed = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 14;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1.5;
    pSeed[i]        = Math.random() * Math.PI * 2;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  const pMat = new THREE.PointsMaterial({
    color: 0x7b4fff, size: 0.016, transparent: true, opacity: 0.55,
    sizeAttenuation: true
  });

  const points = new THREE.Points(pGeo, pMat);
  group.add(points);

  // ── Mouse state ────────────────────────────
  let targetRot = { x: 0, y: 0 };
  let currentRot = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    targetRot.y = ((e.clientX / window.innerWidth)  - 0.5) * 0.28;
    targetRot.x = -((e.clientY / window.innerHeight) - 0.5) * 0.18;
  });

  // ── Drag-to-spin ───────────────────────────
  let dragging = false;
  let dragLast = { x: 0, y: 0 };

  canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    dragLast = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    canvas.style.cursor = '';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = (e.clientX - dragLast.x) * 0.012;
    const dy = (e.clientY - dragLast.y) * 0.007;
    vinylGroup.rotation.y += dx;
    vinylGroup.rotation.x += dy;
    sphere.rotation.y     += dx * 0.5;
    dragLast = { x: e.clientX, y: e.clientY };
  });

  // ── Clock ──────────────────────────────────
  const clock = new THREE.Clock();

  // ── Render loop ────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth parallax
    currentRot.x += (targetRot.x - currentRot.x) * 0.042;
    currentRot.y += (targetRot.y - currentRot.y) * 0.042;
    group.rotation.x = currentRot.x;
    group.rotation.y = currentRot.y;

    // Vinyl auto-spin
    vinylGroup.rotation.y += 0.0042;

    // Gentle bob
    vinylGroup.position.y = 0.65 + Math.sin(t * 0.55) * 0.06;
    sphere.position.y     = -0.45 + Math.sin(t * 0.7 + 1.2) * 0.07;
    wireSphere.position.copy(sphere.position);

    // Sphere vertex wobble
    const pos = sphereGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ox = origPos[i * 3];
      const oy = origPos[i * 3 + 1];
      const oz = origPos[i * 3 + 2];
      const d  = Math.sin(ox * 2.8 + t * 0.9) * Math.cos(oy * 2.8 + t * 0.65) * 0.052;
      pos.setXYZ(i, ox + ox * d, oy + oy * d, oz + oz * d);
    }
    pos.needsUpdate = true;

    sphere.rotation.y     += 0.0025;
    wireSphere.rotation.y -= 0.0012;

    // Particle slow drift
    points.rotation.y += 0.00025;
    points.rotation.x += 0.00010;

    renderer.render(scene, camera);
  }

  animate();

  // ── Resize ─────────────────────────────────
  window.addEventListener('resize', setSize);
})();
