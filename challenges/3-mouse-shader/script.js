const main = document.querySelector(".cursor-main");
const scene = document.querySelector(".scene");

// ===== V3 CONFIG =====
const BUBBLE_COUNT = 1400;
const SIZE_MIN = 1;
const SIZE_MAX = 4;

const DAMPING = 4.2;
const RETURN_FORCE = 3.5;
const CURSOR_RADIUS = 50;
const CURSOR_FORCE = 2200;

const MAX_V = 700;
// =====================

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

function rand(a, b) {
  return a + Math.random() * (b - a);
}

// Bias values toward center using averaged randoms
function centeredRandomX() {
  const r = (Math.random() + Math.random() + Math.random()) / 3;
  return r * window.innerWidth;
}

function centeredRandomY() {
  const r = (Math.random() + Math.random() + Math.random()) / 3;
  return r * window.innerHeight;
}

function makeBubble(size) {
  const el = document.createElement("div");
  el.className = "cursor-bubble";
  el.style.width = size + "px";
  el.style.height = size + "px";
  scene.appendChild(el);
  return el;
}

const bubbles = [];

for (let i = 0; i < BUBBLE_COUNT; i++) {
  const size = rand(SIZE_MIN, SIZE_MAX);

  const x = centeredRandomX();
  const y = centeredRandomY();

  bubbles.push({
    el: makeBubble(size),
    size,
    x,
    y,
    baseX: x,
    baseY: y,
    vx: 0,
    vy: 0,
  });
}

let last = performance.now();

function animate(now) {
  const dt = Math.min((now - last) / 1000, 0.033);
  last = now;

  main.style.left = mouseX + "px";
  main.style.top = mouseY + "px";

  for (const b of bubbles) {
    let ax = (b.baseX - b.x) * RETURN_FORCE;
    let ay = (b.baseY - b.y) * RETURN_FORCE;

    const dx = b.x - mouseX;
    const dy = b.y - mouseY;
    const dist = Math.hypot(dx, dy);

    if (dist < CURSOR_RADIUS) {
      const force = 1 - dist / CURSOR_RADIUS;
      const nx = dx / (dist || 0.001);
      const ny = dy / (dist || 0.001);

      ax += nx * force * CURSOR_FORCE;
      ay += ny * force * CURSOR_FORCE;
    }

    b.vx += ax * dt;
    b.vy += ay * dt;

    b.vx -= b.vx * DAMPING * dt;
    b.vy -= b.vy * DAMPING * dt;

    const v = Math.hypot(b.vx, b.vy);
    if (v > MAX_V) {
      b.vx = (b.vx / v) * MAX_V;
      b.vy = (b.vy / v) * MAX_V;
    }

    b.x += b.vx * dt;
    b.y += b.vy * dt;

    b.el.style.left = b.x + "px";
    b.el.style.top = b.y + "px";
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener("resize", () => {
  for (const b of bubbles) {
    b.baseX = Math.min(b.baseX, window.innerWidth);
    b.baseY = Math.min(b.baseY, window.innerHeight);
  }
});