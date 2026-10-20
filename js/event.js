/* ═══════════════════════════════════════════════════════════════
   FLAGSHIP EVENT TEMPLATE - event extras (page.js covers the shared ones)
   Null-safe: each block runs only when its markup is on the page.
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────── live 3D cube: fetch Three.js only when the band nears view ─────────────── */

const cubeCanvas = document.getElementById("cube-fig");
if (cubeCanvas && "IntersectionObserver" in window) {
  const load = (src) => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.body.appendChild(s);
  });
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    load("js/three.min.js").then(() => load("js/cube-fig.js")).catch(() => {});
  }, { rootMargin: "800px 0px" });
  io.observe(cubeCanvas);
}

/* ─────────────── click-to-play YouTube: no YouTube requests until opened ─────────────── */

const ytButtons = document.querySelectorAll("[data-yt]");
if (ytButtons.length) {
  const box = document.createElement("div");
  box.className = "ev-yt";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Video");
  box.innerHTML = '<button class="ev-yt__close mono" type="button">[ Close ]</button><div class="ev-yt__frame"></div>';
  document.body.appendChild(box);
  const frame = box.querySelector(".ev-yt__frame");
  const closeBtn = box.querySelector(".ev-yt__close");
  let opener = null;

  const close = () => {
    box.classList.remove("is-open");
    frame.innerHTML = "";
    if (opener) opener.focus();
  };
  ytButtons.forEach((btn) => btn.addEventListener("click", () => {
    opener = btn;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(btn.dataset.yt)}?autoplay=1&rel=0&playsinline=1"
      title="${btn.dataset.ytTitle || "Video"}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    box.classList.add("is-open");
    closeBtn.focus();
  }));
  closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && box.classList.contains("is-open")) close(); });
}
