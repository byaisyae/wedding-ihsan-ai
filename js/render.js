// render.js — membaca window.WEDDING_CONFIG (config.js) lalu mengisi halaman.
// Jangan edit data pasangan di sini; edit config.js.
(function () {
  "use strict";
  const C = window.WEDDING_CONFIG;
  if (!C) {
    console.error("[render] config.js belum dimuat / window.WEDDING_CONFIG kosong.");
    return;
  }

  // ---------- Util ----------
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  window.escapeHtml = esc; // dipakai juga oleh script.js (daftar ucapan)

  const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const pad = (n) => String(n).padStart(2, "0");

  function parseDate(iso) {
    const [y, m, d] = String(iso).split("-").map(Number);
    return { y, m, d, dow: new Date(y, m - 1, d).getDay() };
  }
  function longDate(iso) {
    const t = parseDate(iso);
    return `${DAYS[t.dow]}, ${t.d} ${MONTHS[t.m - 1]} ${t.y}`;
  }

  const G = C.groom || {};
  const B = C.bride || {};
  const L = C.location || {};
  const D = parseDate(C.date);
  const toSrc = (item) => (typeof item === "string" ? item : item && item.src) || "";
  const toList = (arr) => (Array.isArray(arr) ? arr.map(toSrc).filter(Boolean) : []);

  // Nilai turunan yang bisa dipakai di atribut data-cfg
  const computed = {
    "couple.title": C.coupleTitle || `${G.nickname} & ${B.nickname}`,
    "date.long": longDate(C.date),
    "date.weekday": DAYS[D.dow],
    "date.day": String(D.d),
    "date.monthYear": `${MONTHS[D.m - 1]} ${D.y}`,
    "date.year": String(D.y),
    "date.dots26": `${pad(D.d)} · ${pad(D.m)} · ${String(D.y).slice(-2)}`,
    "date.dotsFull": `${pad(D.d)} • ${pad(D.m)} • ${D.y}`,
    "groom.instagramUrl": G.instagram ? `https://instagram.com/${G.instagram}` : "",
    "groom.instagramLabel": G.instagram ? `@${G.instagram}` : "",
    "year.now": String(new Date().getFullYear()),
    "footer.instagramUrl": (C.footer || {}).instagram ? `https://www.instagram.com/${C.footer.instagram}` : "",
    "footer.instagramLabel": (C.footer || {}).instagram ? `@${C.footer.instagram}` : "",
    "bride.instagramUrl": B.instagram ? `https://instagram.com/${B.instagram}` : "",
    "bride.instagramLabel": B.instagram ? `@${B.instagram}` : "",
  };

  function get(path) {
    if (Object.prototype.hasOwnProperty.call(computed, path)) return computed[path];
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), C);
  }

  function hide(el) {
    el.classList.add("hidden");
    el.style.display = "none";
  }

  // ---------- Generator blok berulang ----------
  function eventCard(ev, i) {
    const left = i % 2 === 0;
    const aos = left ? "fade-left" : "fade-right";
    const deco = left
      ? "absolute top-0 right-0 w-32 h-32 bg-blueSoft/10 rounded-bl-full -z-0"
      : "absolute top-0 left-0 w-32 h-32 bg-blue-400/10 rounded-br-full -z-0";
    const hover = left ? "hover:border-gold/50" : "hover:border-blue-400/50";
    const dateText = ev.date ? longDate(ev.date) : computed["date.long"];
    const place = ev.place || L.name || "";
    return `
            <div
              class="bg-navy/80 p-8 rounded-3xl border border-blueSoft/30 shadow-[0_15px_30px_rgba(74,143,199,0.15)] relative overflow-hidden group ${hover} hover:scale-105 transition-all duration-300"
              data-aos="${aos}" data-aos-delay="150" data-aos-duration="700"
            >
              <div class="${deco}"></div>
              <h3 class="font-serif text-2xl md:text-3xl text-gold mb-4 relative z-10"><b>${esc(ev.title)}</b></h3>
              <p class="mb-2 text-sm md:text-base text-gray-200 relative z-10">
                <i class="ph-fill ph-calendar-blank text-blueSoft mr-2"></i>${esc(dateText)}
              </p>
              <p class="mb-2 text-sm md:text-base text-gray-200 relative z-10">
                <i class="ph-fill ph-clock text-blueSoft mr-2"></i> ${esc(ev.time)}
              </p>
              ${
                place
                  ? `<p class="text-gray-200 text-xs md:text-sm mb-4 leading-relaxed font-medium">
                <i class="ph-bold ph-map-pin text-blueSoft mr-1 text-sm"></i>${esc(place)}</p>`
                  : ""
              }
            </div>`;
  }

  function renderEvents() {
    const box = document.getElementById("event-cards");
    if (!box) return;
    box.innerHTML = (C.events || []).map(eventCard).join("");
  }

  function renderMasonry() {
    const box = document.getElementById("masonry-grid");
    if (!box) return;
    const items = toList((C.gallery || {}).moments);
    box.innerHTML = items
      .map(
        (src, i) => `
            <div
              class="relative mb-3 md:mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(74,143,199,0.18)] cursor-pointer group"
              data-aos="fade-up" data-aos-duration="450" data-aos-easing="ease-out-cubic" data-aos-delay="${(i % 4) * 50}"
              onclick="openMomentImage(${i})"
            >
              <img src="${esc(src)}" alt="Momen Kebersamaan ${i + 1}" loading="lazy" class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
              <div class="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <i class="ph-bold ph-magnifying-glass-plus text-base"></i>
              </div>
            </div>`
      )
      .join("");
  }

  function renderSideSlides() {
    const box = document.getElementById("side-slides");
    if (!box) return;
    const g = C.gallery || {};
    let slides = toList(g.sideSlides);
    if (!slides.length) slides = toList(g.moments).slice(0, 6);
    box.innerHTML = slides
      .map((src, i) => `<div class="side-slide${i === 0 ? " is-active" : ""}" style="background-image:url('${esc(src)}')"></div>`)
      .join("");
  }

  function bankCard(b, i) {
    const n = i + 1;
    const dir = i % 2 === 0 ? "fade-down-right" : "fade-down-left";
    return `<div
              class="bank-card relative overflow-hidden rounded-[26px] p-5 md:p-6 shadow-[0_20px_45px_rgba(30,41,59,0.18)] border border-white/60 text-left transition-transform min-h-[210px] flex flex-col justify-between"
              style="background: linear-gradient(135deg, #f5f7f9 0%, #e6e9ed 45%, #f0f2f5 100%)"
              data-aos="${dir}"
              data-aos-delay="150"
              data-aos-duration="700"
              >
              <!-- dekorasi diagonal -->
              <div
                class="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-gray-300/50 to-transparent rotate-45 rounded-3xl pointer-events-none"
              ></div>
              <div
                class="absolute right-0 bottom-0 w-28 h-28 pointer-events-none"
                style="
                  background-image: radial-gradient(
                    rgba(100, 116, 139, 0.35) 1px,
                    transparent 1px
                  );
                  background-size: 7px 7px;
                  -webkit-mask-image: linear-gradient(
                    to top left,
                    black 20%,
                    transparent 70%
                  );
                  mask-image: linear-gradient(
                    to top left,
                    black 20%,
                    transparent 70%
                  );
                "
              ></div>

              <!-- baris atas: chip & logo bank -->
              <div class="relative z-10 flex items-start justify-between">
                <svg width="46" height="36" viewBox="0 0 48 38" fill="none">
                  <defs>
                    <linearGradient
                      id="chipGrad${n}"
                      x1="0"
                      y1="0"
                      x2="48"
                      y2="38"
                    >
                      <stop stop-color="#f7e8b0" />
                      <stop offset="0.5" stop-color="#d4af5a" />
                      <stop offset="1" stop-color="#b8860b" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="1"
                    y="1"
                    width="46"
                    height="36"
                    rx="8"
                    fill="url(#chipGrad${n})"
                    stroke="#a97a1f"
                    stroke-width="1"
                  />
                  <line x1="16" y1="1" x2="16" y2="37" stroke="#a97a1f" />
                  <line x1="32" y1="1" x2="32" y2="37" stroke="#a97a1f" />
                  <line x1="1" y1="12" x2="47" y2="12" stroke="#a97a1f" />
                  <line x1="1" y1="25" x2="47" y2="25" stroke="#a97a1f" />
                  <path
                    d="M16 12 Q24 19 32 12"
                    stroke="#a97a1f"
                    fill="none"
                  />
                  <path
                    d="M16 25 Q24 18 32 25"
                    stroke="#a97a1f"
                    fill="none"
                  />
                </svg>
                <div class="flex items-center gap-1.5">
                  
                  <img src="${esc(b.logo)}" alt="Logo ${esc(b.bank)}" class="w-20 h-20" />
                </div>
              </div>

              <!-- baris bawah: nama, nomor rekening & tombol copy -->
              <div
                class="relative z-10 flex items-end justify-between gap-3 mt-8"
              >
                <div class="min-w-0">
                  <p
                    class="font-bold text-gray-800 text-sm md:text-base mb-1 truncate"
                  >
                    ${esc(b.holder)}
                  </p>
                  <p
                    id="rek${n}"
                    class="font-extrabold text-gray-900 text-lg md:text-2xl tracking-wide font-mono"
                  >
                    ${esc(b.number)}
                  </p>
                </div>
                <button
                  onclick="copyText('rek${n}')"
                  class="flex-shrink-0 flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs md:text-sm font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-md"
                  aria-label="Salin nomor ${esc(b.bank)} ${esc(b.holder)}"
                >
                  <i class="ph-bold ph-copy-simple text-base"></i> Copy
                </button>
              </div>
            </div>`;
  }

  function renderGift() {
    const gift = C.gift || {};
    const section = document.getElementById("gift");
    if (gift.enabled === false || !section) {
      if (section) hide(section);
      document.querySelectorAll('#dock-nav a[href="#gift"]').forEach(hide);
      return;
    }

    const banks = document.getElementById("bank-cards");
    if (banks) banks.innerHTML = (gift.accounts || []).map(bankCard).join("");

    const addr = Array.isArray(gift.address) ? gift.address.filter(Boolean) : [];
    const addrEl = document.getElementById("alamat-kado");
    const addrCard = document.getElementById("gift-address-card");
    if (addrEl && addr.length) addrEl.innerHTML = addr.map(esc).join("<br />\n");
    else if (addrCard) hide(addrCard);

    const wa = gift.whatsapp || {};
    const waEl = document.getElementById("gift-wa");
    if (waEl) {
      if (wa.number) {
        const msg = String(wa.message || "")
          .replace(/\{groom\}/g, G.nickname || "")
          .replace(/\{bride\}/g, B.nickname || "");
        waEl.href = `https://wa.me/${wa.number}` + (msg ? `?text=${encodeURIComponent(msg)}` : "");
      } else {
        hide(waEl);
      }
    }
  }

  function renderVideo() {
    const section = document.getElementById("video");
    const id = (C.video || {}).youtubeId;
    if (!section) return;
    if (!id) {
      hide(section);
      return;
    }
    const iframe = document.getElementById("video-embed");
    if (iframe) iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&rel=0&loop=1&playlist=${encodeURIComponent(id)}`;
  }

  function renderAudio() {
    const m = C.music || {};
    const a = document.getElementById("audio-player");
    if (a && !(m.source === "youtube" && m.youtubeId) && m.file) {
      a.src = m.file;
      a.preload = "auto";
    }
  }

  // ---------- Binding atribut data-* ----------
  function applyBindings() {
    document.querySelectorAll("[data-cfg]").forEach((el) => {
      const v = get(el.getAttribute("data-cfg"));
      if (v !== undefined && v !== null) el.textContent = v;
    });
    document.querySelectorAll("[data-cfg-html]").forEach((el) => {
      const v = get(el.getAttribute("data-cfg-html"));
      if (v !== undefined && v !== null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-cfg-attr]").forEach((el) => {
      el.getAttribute("data-cfg-attr")
        .split(";")
        .forEach((pair) => {
          const idx = pair.indexOf(":");
          if (idx < 0) return;
          const attr = pair.slice(0, idx).trim();
          const v = get(pair.slice(idx + 1).trim());
          if (v !== undefined && v !== null && v !== "") el.setAttribute(attr, v);
        });
    });
    document.querySelectorAll("[data-cfg-bg]").forEach((el) => {
      const v = get(el.getAttribute("data-cfg-bg"));
      if (v) el.style.backgroundImage = `url('${v}')`;
    });
    document.querySelectorAll("[data-cfg-hide-if-empty]").forEach((el) => {
      if (!get(el.getAttribute("data-cfg-hide-if-empty"))) hide(el);
    });
  }

  renderEvents();
  renderMasonry();
  renderSideSlides();
  renderGift();
  renderVideo();
  renderAudio();
  applyBindings();
  document.title = `Undangan Pernikahan | ${computed["couple.title"]}`;
})();
