const main = document.querySelector(".cursor-main");
const layers = [...document.querySelectorAll(".cursor-layer")];

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let mainX = mouseX;
let mainY = mouseY;

const state = layers.map((el) => {
  const size = Number(el.dataset.size);
  const speed = Number(el.dataset.speed);

  el.style.width = `${size}px`;
  el.style.height = `${size}px`;

  return { el, x: mouseX, y: mouseY, speed };
});

function animate() {
  // main circle follows very tightly
  mainX += (mouseX - mainX) * 0.35;
  mainY += (mouseY - mainY) * 0.35;

  main.style.left = `${mainX}px`;
  main.style.top = `${mainY}px`;

  // outer layers follow main
  for (const s of state) {
    s.x += (mainX - s.x) * s.speed;
    s.y += (mainY - s.y) * s.speed;

    s.el.style.left = `${s.x}px`;
    s.el.style.top = `${s.y}px`;
  }

  requestAnimationFrame(animate);
}

animate();

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  main.style.opacity = "1";
  layers.forEach((el) => (el.style.opacity = "1"));
});

document.addEventListener("mouseleave", () => {
  main.style.opacity = "0";
  layers.forEach((el) => (el.style.opacity = "0"));
});

window.addEventListener("blur", () => {
  main.style.opacity = "0";
  layers.forEach((el) => (el.style.opacity = "0"));
});