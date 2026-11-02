// gallery.js — semua logika galeri foto:
// cache gambar (localStorage) + retry, lightbox/modal, masonry "Kilas Balik",
// carousel 3D "Momen Pilihan", dan zoom foto profil mempelai.

// ===== Utilitas cache gambar galeri (localStorage) + retry otomatis =====
// Supaya thumbnail/foto tidak "hilang-hilangan" saat koneksi lambat/putus-putus:
// 1) Sekali berhasil dimuat, gambar disimpan sebagai data URL di localStorage
//    sehingga kunjungan/perpindahan berikutnya tidak perlu request ulang ke server.
// 2) Jika gambar gagal dimuat (event error), otomatis dicoba ulang beberapa kali.
const GALLERY_CACHE_PREFIX = "galimg:";
const GALLERY_CACHE_MAX_BYTES = 450 * 1024; // ~450KB/gambar, jaga agar kuota localStorage tidak cepat penuh

function getCachedGalleryImage(src) {
  try {
    return localStorage.getItem(GALLERY_CACHE_PREFIX + src);
  } catch (e) {
    return null;
  }
}

function setCachedGalleryImage(src, dataUrl) {
  try {
    localStorage.setItem(GALLERY_CACHE_PREFIX + src, dataUrl);
  } catch (e) {
    // kemungkinan localStorage penuh, biarkan saja & lanjut pakai network seperti biasa
  }
}

function fetchAndCacheGalleryImage(src) {
  if (getCachedGalleryImage(src)) return;
  fetch(src)
    .then((res) => (res.ok ? res.blob() : Promise.reject()))
    .then((blob) => {
      if (blob.size > GALLERY_CACHE_MAX_BYTES) return;
      const reader = new FileReader();
      reader.onload = () => setCachedGalleryImage(src, reader.result);
      reader.readAsDataURL(blob);
    })
    .catch(() => {
      /* gagal cache tidak masalah, gambar tetap tampil dari network */
    });
}

function loadGalleryImage(imgEl, src, alt) {
  if (!imgEl || !src) return;
  imgEl.dataset.currentSrc = src;
  if (alt) imgEl.alt = alt;
  const cached = getCachedGalleryImage(src);
  if (cached) {
    imgEl.src = cached;
  } else {
    imgEl.src = src;
    fetchAndCacheGalleryImage(src);
  }
}

function attachGalleryImageRetry(imgEl, maxRetries = 2) {
  if (!imgEl || imgEl.dataset.retryAttached) return;
  imgEl.dataset.retryAttached = "1";
  let attempts = 0;
  imgEl.addEventListener("load", () => {
    attempts = 0;
  });
  imgEl.addEventListener("error", () => {
    const target = imgEl.dataset.currentSrc;
    if (!target) return;
    attempts++;
    if (attempts > maxRetries) return;
    setTimeout(() => {
      // coba ulang langsung dari network (lewati cache yang mungkin korup)
      imgEl.src =
        target + (target.includes("?") ? "&" : "?") + "retry=" + Date.now();
    }, 500 * attempts);
  });
}

// Lightbox Modal Functions
let modalImages = [];
let modalSource = "featured"; // "featured" (img/grt, dsb) atau "masonry" (img/bdg)
let currentModalIndex = 0;

// Sumber gambar diambil dari config.js (gallery.moments / gallery.featured, groom.photo / bride.photo)
const _CFG = window.WEDDING_CONFIG || {};
const _GAL = _CFG.gallery || {};
const _toImgs = (arr, label) =>
  (arr || []).map((it, i) =>
    typeof it === "string" ? { src: it, alt: `${label} ${i + 1}` } : { alt: `${label} ${i + 1}`, ...it },
  );

// Galeri masonry "Kilas Balik Kebersamaan"
const momentImages = _toImgs(_GAL.moments, "Momen Kebersamaan");

// Sumber gambar untuk carousel 3D "Momen Pilihan" (img/grt)
const momenPilihanImages = _toImgs(_GAL.featured, "Momen Pilihan");

window.openMomentImage = function (index) {
  modalImages = momentImages;
  modalSource = "masonry";
  openModal(index);
};

// Sumber gambar untuk foto profil mempelai (pria & wanita)
const profileImages = [
  { src: (_CFG.groom || {}).photo, alt: (_CFG.groom || {}).fullName },
  { src: (_CFG.bride || {}).photo, alt: (_CFG.bride || {}).fullName },
];

window.openProfileImage = function (index) {
  modalImages = profileImages;
  modalSource = "profile";
  openModal(index);
};
let modalTouchStartX = 0;
let modalTouchStartY = 0;

function initModalGallery() {
  const modal = document.getElementById("imageModal");
  if (!modal) return;

  const modalImg = document.getElementById("modalImage");
  attachGalleryImageRetry(modalImg);

  modal.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches || !e.touches[0]) return;
      modalTouchStartX = e.touches[0].clientX;
      modalTouchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  modal.addEventListener(
    "touchend",
    (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - modalTouchStartX;
      const deltaY = endY - modalTouchStartY;

      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          showNextModalImage();
        } else {
          showPrevModalImage();
        }
      }
    },
    { passive: true },
  );
}

function showModalImage(index) {
  if (!modalImages.length) return;

  if (index < 0) index = modalImages.length - 1;
  if (index >= modalImages.length) index = 0;

  currentModalIndex = index;
  const sourceImg = modalImages[currentModalIndex];
  const modalImg = document.getElementById("modalImage");
  loadGalleryImage(
    modalImg,
    sourceImg.src,
    sourceImg.alt || `Momen ${currentModalIndex + 1}`,
  );

  // sinkronkan foto utama & thumbnail aktif dengan modal
  // (hanya untuk galeri "featured"/template lama, bukan galeri masonry)
  if (
    modalSource === "featured" &&
    typeof window.setFeaturedGalleryIndex === "function"
  ) {
    window.setFeaturedGalleryIndex(currentModalIndex, { scroll: true });
  }
}

function showPrevModalImage() {
  showModalImage(currentModalIndex - 1);
}

function showNextModalImage() {
  showModalImage(currentModalIndex + 1);
}

window.showPrevModalImage = showPrevModalImage;
window.showNextModalImage = showNextModalImage;

function openModal(index) {
  if (!modalImages.length) return;
  currentModalIndex = index >= 0 ? index : 0;

  const modal = document.getElementById("imageModal");
  showModalImage(currentModalIndex);
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

// AOS will control the sequence animations; manual sequence removed.

function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

// Featured Gallery (foto utama berupa carousel track + strip thumbnail)
function setup3DMomentCarousel() {
  const stage = document.getElementById("moment-3d-stage");
  const track = document.getElementById("moment-3d-track");
  const prevBtn = document.getElementById("moment-3d-prev");
  const nextBtn = document.getElementById("moment-3d-next");
  if (!stage || !track) return;

  const total = momenPilihanImages.length;
  if (!total) return;

  modalImages = momenPilihanImages;
  modalSource = "featured";

  // Bangun semua slide sekaligus, TIDAK ada kloning slide sama sekali.
  // Infinite carousel dicapai murni lewat matematika: posisi tiap slide
  // dihitung ulang dari jarak melingkar (circular distance) ke slide aktif,
  // jadi bisa diputar ke kiri/kanan selamanya tanpa pernah "mentok" atau lompat.
  const slideEls = momenPilihanImages.map((data, i) => {
    const el = document.createElement("div");
    el.className =
      "moment-3d-slide absolute top-1/2 left-1/2 w-[68%] sm:w-[46%] h-[86%] sm:h-[92%] rounded-2xl overflow-hidden shadow-[0_20px_45px_rgba(30,41,59,0.35)] cursor-pointer bg-gray-200";
    el.style.transformStyle = "preserve-3d";
    el.style.backfaceVisibility = "hidden";
    el.style.willChange = "transform, opacity, filter";
    el.style.transition =
      "transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease, filter 700ms ease";

    const img = document.createElement("img");
    img.alt = data.alt;
    img.decoding = "async";
    if (i === 0) img.fetchPriority = "high";
    img.className = "w-full h-full object-cover pointer-events-none";
    el.appendChild(img);

    // Badge "Lihat" + ikon zoom, menandakan foto bisa diklik untuk diperbesar
    const badge = document.createElement("div");
    badge.className =
      "absolute bottom-3 right-3 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm pointer-events-none";
    badge.innerHTML = '<i class="ph-bold ph-arrows-out"></i> Lihat';
    el.appendChild(badge);

    // Simpan rasio asli foto (lebar/tinggi) sebagai CSS variable --ar.
    // Di desktop (>=1024px) slide dibentuk mengikuti rasio ini (lihat style.css),
    // jadi foto potret tampil tinggi & tidak terpotong.
    const applyRatio = () => {
      if (img.naturalWidth && img.naturalHeight) {
        el.style.setProperty("--ar", (img.naturalWidth / img.naturalHeight).toFixed(4));
      }
    };
    img.addEventListener("load", applyRatio);

    loadGalleryImage(img, data.src, data.alt);
    attachGalleryImageRetry(img);
    if (img.complete) applyRatio();

    track.appendChild(el);
    return el;
  });

  let activeIndex = 0;

  function render() {
    slideEls.forEach((el, i) => {
      let diff = i - activeIndex;
      // jarak melingkar terpendek supaya carousel benar-benar seamless/infinite
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      const absDiff = Math.abs(diff);
      let translateX, scale, rotateY, zIndex, opacity, blurPx;

      if (absDiff === 0) {
        translateX = 0;
        scale = 1;
        rotateY = 0;
        zIndex = 30;
        opacity = 1;
        blurPx = 0;
      } else if (absDiff === 1) {
        translateX = diff > 0 ? 58 : -58;
        scale = 0.74;
        rotateY = diff > 0 ? -32 : 32;
        zIndex = 20;
        opacity = 0.85;
        blurPx = 1;
      } else if (absDiff === 2) {
        translateX = diff > 0 ? 100 : -100;
        scale = 0.55;
        rotateY = diff > 0 ? -42 : 42;
        zIndex = 10;
        opacity = 0.45;
        blurPx = 2;
      } else {
        translateX = diff > 0 ? 132 : -132;
        scale = 0.4;
        rotateY = diff > 0 ? -42 : 42;
        zIndex = 0;
        opacity = 0;
        blurPx = 2;
      }

      el.style.transform = `translate(-50%, -50%) translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`;
      el.style.zIndex = String(zIndex);
      el.style.opacity = String(opacity);
      el.style.filter = blurPx ? `blur(${blurPx}px)` : "none";
      el.style.pointerEvents = absDiff <= 2 ? "auto" : "none";
    });
  }

  function goTo(index) {
    // modulo positif: bisa diputar terus-menerus ke arah manapun (infinite)
    activeIndex = ((index % total) + total) % total;
    render();
  }

  // expose supaya modal bisa menyinkronkan carousel saat geser di lightbox
  window.setFeaturedGalleryIndex = (index) => goTo(index);

  // Autoplay: otomatis berganti foto, berhenti sebentar saat berinteraksi.
  const AUTOPLAY_INTERVAL = 5000;
  const AUTOPLAY_RESUME_DELAY = 4500;
  let autoplayTimer = null;
  let resumeTimer = null;

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goTo(activeIndex + 1);
    }, AUTOPLAY_INTERVAL);
  };

  function pauseThenResume() {
    stopAutoplay();
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => startAutoplay(), AUTOPLAY_RESUME_DELAY);
  }

  let dragMoved = false; // true kalau interaksi terakhir adalah geser, bukan tap/klik

  slideEls.forEach((el, i) => {
    el.addEventListener("click", () => {
      if (dragMoved) return; // ini bekas drag, bukan klik
      if (i === activeIndex) {
        // pastikan sumber galeri untuk lightbox selalu galeri "Momen Pilihan",
        // bukan sisa dari galeri lain (mis. "Kilas Balik") yang terakhir dibuka
        modalImages = momenPilihanImages;
        modalSource = "featured";
        openModal(activeIndex);
      } else {
        goTo(i);
        pauseThenResume();
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goTo(activeIndex - 1);
      pauseThenResume();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goTo(activeIndex + 1);
      pauseThenResume();
    });
  }

  stage.addEventListener("mouseenter", stopAutoplay);
  stage.addEventListener("mouseleave", startAutoplay);

  // Swipe/drag (mouse & touch lewat Pointer Events) untuk pindah slide
  let isDragging = false;
  let dragStartX = 0;

  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    stopAutoplay();
    // CATATAN: jangan pakai stage.setPointerCapture() di sini. Dengan capture,
    // event "click" dialihkan ke stage sehingga klik pada slide (zoom "Lihat")
    // tidak pernah terpicu saat memakai mouse di mode desktop.
  });

  stage.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    if (Math.abs(e.clientX - dragStartX) > 6) dragMoved = true;
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = (e.clientX || dragStartX) - dragStartX;
    const threshold = 40;
    if (deltaX <= -threshold) {
      goTo(activeIndex + 1);
    } else if (deltaX >= threshold) {
      goTo(activeIndex - 1);
    }
    pauseThenResume();
    // dragMoved dilepas sedikit belakangan supaya event "click" yang
    // menyusul persis setelah ini masih sempat membaca nilainya
    setTimeout(() => {
      dragMoved = false;
    }, 0);
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", () => {
    isDragging = false;
  });
  stage.addEventListener("pointerleave", () => {
    if (isDragging) endDrag({ clientX: dragStartX });
  });

  render();
  startAutoplay();
  initModalGallery();
}
