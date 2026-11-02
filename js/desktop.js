// desktop.js — efek khusus laptop/PC (>= 1024px):
// 1) foto di kiri berganti mengikuti bagian yang sedang dibaca + sedikit parallax
(function () {
  const mq = window.matchMedia("(min-width: 1024px)");
  const slidesWrap = document.getElementById("side-slides");
  const slides = Array.from(document.querySelectorAll(".side-slide"));
  // urutan harus sama dengan urutan .side-slide di HTML
  const sectionIds = ["hero-soft-blue", "profile", "event", "gallery", "gift", "rsvp"];
  let ticking = false;

  function update() {
    ticking = false;
    if (!mq.matches) return;
    const vh = window.innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const p = Math.min(1, Math.max(0, window.scrollY / max));

    // --- foto kiri: pilih slide sesuai section di tengah layar ---
    let idx = 0;
    sectionIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= vh * 0.5) idx = i;
    });
    idx = Math.min(idx, slides.length - 1);
    slides.forEach((el, i) => el.classList.toggle("is-active", i === idx));
    if (slidesWrap) {
      slidesWrap.style.transform =
        "translate3d(0," + (p - 0.5) * -60 + "px,0) scale(1.1)";
    }

  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", update);
  update();
})();
