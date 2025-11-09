const canvas = document.getElementById("circuit-bg");
const ctx = canvas.getContext("2d");
let w, h, sparks = [];

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function newSpark() {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.5 + 0.2,
    alpha: Math.random() * 0.5 + 0.3
  };
}
for (let i = 0; i < 100; i++) sparks.push(newSpark());

function draw() {
  ctx.clearRect(0, 0, w, h);
  for (const s of sparks) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(56,189,248,${s.alpha})`;
    ctx.fill();

    s.y += s.speed;
    s.alpha -= 0.001;
    if (s.y > h || s.alpha <= 0) Object.assign(s, newSpark(), { y: 0 });
  }
  requestAnimationFrame(draw);
}
draw();
