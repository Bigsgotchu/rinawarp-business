(() => {
  // Footer year
  const y = document.getElementById("y");
  if (y) y.textContent = String(new Date().getFullYear());

  // Reveal on load + scroll (very light)
  const els = Array.from(document.querySelectorAll(".reveal"));
  const show = (el) => el.classList.add("is-visible");

  // Instant reveal for above-the-fold
  els.slice(0, 2).forEach(show);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          show(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  els.slice(2).forEach((el) => io.observe(el));
})();