#!/usr/bin/env node
// build-meta.js — menulis <title> + meta preview link (Open Graph / Twitter) di index.html
// berdasarkan config.js. Perlu dijalankan karena WhatsApp/Instagram/Telegram membaca meta tag
// langsung dari HTML dan TIDAK menjalankan JavaScript.
//
// Pemakaian:  node tools/build-meta.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "config.js"), "utf8"), sandbox);
const C = sandbox.window.WEDDING_CONFIG;
if (!C) throw new Error("config.js tidak menghasilkan window.WEDDING_CONFIG");

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const [y, m, d] = C.date.split("-").map(Number);
const dateLong = `${DAYS[new Date(y, m - 1, d).getDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;

const title = C.coupleTitle || `${C.groom.nickname} & ${C.bride.nickname}`;
const site = (C.site && C.site.url) || "";
const desc =
  (C.site && C.site.description) ||
  `${dateLong} — Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.`;
let img = (C.site && C.site.ogImage) || "";
if (img && !/^https?:\/\//.test(img)) img = site + img.replace(/^\.?\//, "");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const pageTitle = `Undangan Pernikahan | ${title}`;
const ogTitle = `Undangan Pernikahan ${title}`;

const block = `<!-- META:START (dibuat otomatis oleh tools/build-meta.js — jangan diedit manual) -->
    <title>${esc(pageTitle)}</title>
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(ogTitle)}" />
    <meta property="og:title" content="${esc(ogTitle)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:image" content="${esc(img)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${esc(site)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(ogTitle)}" />
    <meta name="twitter:description" content="${esc(desc)}" />
    <meta name="twitter:image" content="${esc(img)}" />
    <!-- META:END -->`;

const file = path.join(root, "index.html");
const html = fs.readFileSync(file, "utf8");
const re = /<!-- META:START[\s\S]*?<!-- META:END -->/;
if (!re.test(html)) throw new Error("Penanda META:START / META:END tidak ditemukan di index.html");
fs.writeFileSync(file, html.replace(re, () => block));
console.log("OK — meta diperbarui untuk:", title);
if (!/^https?:\/\//.test(site)) console.warn("PERINGATAN: site.url di config.js belum URL lengkap (https://...).");
