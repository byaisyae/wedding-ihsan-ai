// ============================================================================
//  config.js — SATU-SATUNYA file yang perlu diedit untuk membuat undangan baru.
//  Semua data pasangan (nama, tanggal, lokasi, musik, foto, rekening, dll)
//  ada di sini. Jangan ubah index.html / js/*.js untuk ganti data pasangan.
//
//  Catatan: setelah mengubah nama / tanggal / deskripsi / domain, jalankan
//      node tools/build-meta.js
//  supaya judul tab & preview link WhatsApp ikut berubah (lihat README.md).
// ============================================================================
window.WEDDING_CONFIG = {
  // ---------- Pengaturan situs & preview link ----------
  site: {
    // URL lengkap tempat undangan di-hosting (wajib diakhiri "/")
    url: "https://saevitation.com/wedding-ihsan-ai/",
    // Foto untuk preview link WhatsApp/IG (path relatif ke folder ini, ukuran ideal 1200x630)
    ogImage: "img/grt/1.webp",
    // Kosongkan untuk memakai deskripsi otomatis
    description: "",
  },

  // ---------- Mempelai ----------
  groom: {
    nickname: "Ihsan", // nama panggilan (dipakai di cover & judul)
    fullName: "Ihsan Miftahul Huda, S.T", // nama lengkap + gelar
    intro: "Mempelai pria merupakan putra kedua dari",
    parents: "Bapak H. Nana Subarna, S.P & Ibu Hj. Popon Rohayati",
    instagram: "isanz_mh", // tanpa @ ; kosongkan untuk menyembunyikan tombol
    photo: "img/ihsan.webp",
  },
  bride: {
    nickname: "Ai Liana",
    fullName: "Ai Liana Nuraeni",
    intro: "Mempelai wanita merupakan putri pertama dari",
    parents: "Bapak Ajat Sudrajat & Ibu Yuyun Yulinda",
    instagram: "ailiananuraeni",
    photo: "img/ai.webp",
  },
  // Judul pasangan. Kosongkan untuk otomatis "<groom.nickname> & <bride.nickname>".
  coupleTitle: "",

  // ---------- Tanggal ----------
  date: "2026-10-11", // format YYYY-MM-DD (hari & bulan ditulis otomatis dalam bahasa Indonesia)
  countdown: "2026-10-11T08:00:00", // target hitung mundur (waktu setempat)

  // ---------- Rangkaian acara (tambah / hapus sesuka hati) ----------
  events: [
    { title: "Akad Nikah", time: "10.00 WIB" },
    { title: "Resepsi", time: "11.00 - 14.00 WIB" },
    // Opsional per acara: date: "2026-10-12" (jika beda hari), place: "Nama tempat lain"
  ],

  // ---------- Lokasi ----------
  location: {
    name: "Gedung Bumdes Salebu",
    address: "Salebu, Kec. Mangunreja, Kab. Tasikmalaya",
    mapsUrl: "https://maps.app.goo.gl/9E7wXC2dEybcpE6aA", // tombol "Buka Maps"
    // Google Maps > Bagikan > Sematkan peta > salin isi src="..." dari iframe
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.199464016629!2d108.0649161!3d-7.373953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f55d692a021f3%3A0xd31bb4235449937e!2sGedung%20Bumdes%20Salebu!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid",
  },

  // ---------- Musik latar ----------
  music: {
    source: "file", // "file" = pakai file mp3 sendiri, "youtube" = pakai audio dari video YouTube
    file: "sound/nadin.mp3", // dipakai jika source: "file"
    youtubeId: "", // dipakai jika source: "youtube" (ID video, mis. "ugk5pd9xgSw")
  },

  // ---------- Video (section "Momen Spesial Kami") ----------
  video: {
    youtubeId: "UKbV22Zm10c", // kosongkan untuk menyembunyikan section video
  },

  // ---------- Galeri (path relatif ke folder ini) ----------
  images: {
    cover: "img/bdg/9.webp", // latar cover (HP) & foto kiri cover (desktop)
    coverPanel: "img/bdg/3.webp", // latar panel kanan cover (desktop)
  },
  gallery: {
    // Foto yang berganti di panel kiri versi desktop (urut: hero, profil, acara, galeri, kado, buku tamu)
    sideSlides: [
      "img/bdg/9.webp",
      "img/bdg/4.webp",
      "img/bdg/6.webp",
      "img/bdg/8.webp",
      "img/bdg/3.webp",
      "img/grt/1.webp",
    ],
    // "Kilas Balik Kebersamaan" (grid masonry)
    moments: [
      "img/bdg/1.webp",
      "img/bdg/3.webp",
      "img/bdg/4.webp",
      "img/bdg/5.webp",
      "img/bdg/6.webp",
      "img/bdg/7.webp",
      "img/bdg/8.webp",
      "img/bdg/9.webp",
    ],
    // "Momen Pilihan" (carousel 3D)
    featured: [
      "img/grt/1.webp",
      "img/grt/2.webp",
      "img/grt/3.webp",
      "img/grt/4.webp",
      "img/grt/5.webp",
      "img/grt/06.webp",
      "img/grt/07.webp",
      "img/grt/08.webp",
      "img/grt/09.webp",
      "img/grt/010.webp",
      "img/grt/11.webp",
      "img/grt/012.webp",
      "img/grt/12.webp",
      "img/grt/013.webp",
      "img/grt/13.webp",
      "img/grt/014.webp",
      "img/grt/14.webp",
      "img/grt/15.webp",
      "img/grt/17.webp",
      "img/grt/16.webp",
    ],
  },

  // ---------- Amplop digital & kado ----------
  gift: {
    enabled: true, // false = sembunyikan seluruh section
    accounts: [
      {
        bank: "BCA",
        logo: "img/bca.svg",
        holder: "IHSAN MIFTAHUL HUDA",
        number: "2832362752",
      },
      {
        bank: "BCA",
        logo: "img/bca.svg",
        holder: "AI LIANA NURAENI",
        number: "1093162114",
      },
    ],
    // Alamat kirim kado fisik, satu baris per item. Kosongkan [] untuk menyembunyikan kartu alamat.
    address: [
      "Penerima: AI LIANA NURAENI",
      "Jalan Bojong,Kp Bojong, RT.24/RW.3, Ds Salebu, Kec Mangunreja, Kab Tasikmalaya, Jawa Barat",
      "Patokan: MTs Al-Hidayah Salebu",
    ],
    whatsapp: {
      number: "6282317214230", // format internasional tanpa + ; kosongkan untuk menyembunyikan tombol
      message:
        "Halo kak! Aku udah kirim kado/amplop digital nih buat pernikahan Kak {groom} dan {bride} 🎉 Semoga berkenan ya, makasih banyak! 🙏😁",
    },
  },

  // ---------- Buku tamu (Google Apps Script) ----------
  guestbook: {
    // Setiap pasangan sebaiknya punya Google Sheet + Apps Script sendiri.
    // Kosongkan untuk menonaktifkan (form akan memberi pesan "belum terhubung").
    scriptUrl:
      "https://script.google.com/macros/s/AKfycbwmeKz0v9qIH2MVbBEQTUgVTHf35UwPdEDJkw-VtTzNwGIS6pdjfg0gtA286pCEPdbz-Q/exec",
  },

  // ---------- Footer ----------
  footer: {
    copyright: "Aisyae Digital Invitation — Dibuat dengan cinta.", // tampil setelah "© <tahun berjalan>"
    designedBy: { label: "saevitation.com", url: "https://saevitation.com/" }, // kosongkan url untuk menyembunyikan
    instagram: "saevitation", // tanpa @ ; kosongkan untuk menyembunyikan
  },
};
