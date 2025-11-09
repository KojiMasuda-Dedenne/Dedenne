const img = document.querySelector(".hero-img");

document.addEventListener("mousemove", (e) => {
  const { innerWidth, innerHeight } = window;
  const x = (e.clientX / innerWidth - 0.5) * 20;
  const y = (e.clientY / innerHeight - 0.5) * 20;
  img.style.transform = `translate(${x}px, ${y}px) scale(1)`;
});

img.addEventListener("mouseenter", () => {
  img.style.transition = "transform 0.2s ease, filter 0.3s ease";
});
img.addEventListener("mouseleave", () => {
  img.style.transition = "transform 0.6s ease, filter 0.3s ease";
  img.style.transform = "translate(0, 0) scale(1)";
});
