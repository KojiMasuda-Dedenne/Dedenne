window.addEventListener("load", () => {
  const messages = [
    "Initializing Lumiose Circuits...",
    "Activating Security Subsystems...",
    "Calibrating Spark Output...",
    "Establishing Neural Link...",
    "System Online — Welcome Back, Operator."
  ];

  let i = 0;
  const bootText = document.getElementById("boot-text");

  const cycle = setInterval(() => {
    bootText.textContent = messages[i];
    i++;
    if (i >= messages.length) {
      clearInterval(cycle);
      // wait a little before fading out
      setTimeout(() => document.body.classList.add("loaded"), 800);
    }
  }, 700);
});
