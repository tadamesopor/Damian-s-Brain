const main = document.querySelector(".cursor-main");
const scene = document.querySelector(".scene");

// ===== CONFIG =====
const BUBBLE_COUNT = 220;   // try 150–400
const SIZE_MIN = 6;
const SIZE_MAX = 16;

const DAMPING = 3.2;
const RETURN_FORCE = 6;     // how fast they go back to original spot
const CURSOR_RADIUS = 120;  // interaction range
const CURSOR_FORCE = 1800;  // how strong cursor pushes

const MAX_V = 900;
// ===================

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function makeBubble(size) {
  const el = document.createElement("div");
  el.className = "cursor-bubble";
  el.style.width = size + "px";
  el.style.height = size + "px";
  scene.appendChild(el); // ✅ important: put bubbles inside .scene layer
  return el;
}

const bubbles = [];
for (let i = 0; i < BUBBLE_COUNT; i++) {
  const size = rand(SIZE_MIN, SIZE_MAX);
  const x = rand(0, window.innerWidth);
  const y = rand(0, window.innerHeight);

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

  // cursor visual
  main.style.left = mouseX + "px";
  main.style.top = mouseY + "px";

  for (const b of bubbles) {
    // return to original position
    let ax = (b.baseX - b.x) * RETURN_FORCE;
    let ay = (b.baseY - b.y) * RETURN_FORCE;

    // cursor repulsion
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

    // integrate
    b.vx += ax * dt;
    b.vy += ay * dt;

    // damping
    b.vx -= b.vx * DAMPING * dt;
    b.vy -= b.vy * DAMPING * dt;

    // clamp velocity
    const v = Math.hypot(b.vx, b.vy);
    if (v > MAX_V) {
      b.vx = (b.vx / v) * MAX_V;
      b.vy = (b.vy / v) * MAX_V;
    }

    // update position
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // draw
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

// keep bubbles correct if you resize
window.addEventListener("resize", () => {
  for (const b of bubbles) {
    // re-place bases inside new bounds
    b.baseX = Math.min(b.baseX, window.innerWidth);
    b.baseY = Math.min(b.baseY, window.innerHeight);
  }
});