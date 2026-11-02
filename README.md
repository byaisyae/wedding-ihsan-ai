# Template Undangan Pernikahan Digital

Satu kode, banyak pasangan. **Semua data pasangan ada di `config.js`.**
Contoh saat ini: Ihsan & Ai Liana (11 Oktober 2026).

## Membuat undangan untuk pasangan baru

1. **Salin seluruh folder** proyek ini (satu folder per pasangan), mis. `undangan-raka-dewi/`.
2. Ganti isi folder `img/` dengan foto pasangan baru (format `.webp` disarankan) dan ganti file musik (`nadin.mp3`) jika perlu.
3. Edit **`config.js`**: nama, tanggal, acara, lokasi, musik, foto, rekening, dst. Setiap bagian ada komentarnya.
4. Jalankan **sekali** (butuh Node.js):
   ```bash
   node tools/build-meta.js
   ```
   Ini mengisi `<title>` dan preview link WhatsApp/IG/Telegram di `index.html`.
   Wajib karena aplikasi tersebut membaca meta tag langsung dari HTML dan tidak menjalankan JavaScript.
5. Upload ke hosting (GitHub Pages / Netlify / dll). Pastikan `site.url` di `config.js` sama dengan alamat akhirnya.
6. Link ke tamu: `https://domain-kamu/?to=Nama%20Tamu`

## Apa saja yang bisa diatur di `config.js`

| Bagian | Isi |
| --- | --- |
| `site` | URL situs, foto preview link, deskripsi preview |
| `groom` / `bride` | nama panggilan, nama lengkap, orang tua, Instagram, foto |
| `date`, `countdown` | tanggal acara (hari & bulan otomatis berbahasa Indonesia) dan target hitung mundur |
| `events` | daftar acara (Akad, Resepsi, dst). Bebas tambah/hapus, bisa beda tanggal/tempat per acara |
| `location` | nama tempat, alamat, link Maps, embed peta |
| `music` | `source: "file"` (mp3 sendiri) atau `"youtube"` (audio dari video YouTube) |
| `video` | ID video YouTube section "Momen Spesial Kami" (kosong = section disembunyikan) |
| `images`, `gallery` | foto cover, slide panel kiri desktop, galeri masonry, carousel 3D |
| `gift` | rekening (bisa lebih dari 2), alamat kado, tombol WhatsApp (kosong = disembunyikan) |
| `guestbook.scriptUrl` | URL Google Apps Script untuk buku tamu (satu per pasangan) |
| `footer` | teks copyright, "Designed with love by" (nama + URL), dan Instagram pembuat |

## Struktur

```
config.js            <- EDIT INI untuk pasangan baru
index.html           kerangka halaman (tidak perlu diedit untuk ganti data)
tools/build-meta.js  menulis title + meta preview link dari config.js
js/render.js         mengisi halaman dari config.js (acara, galeri, rekening, dll)
js/music.js          musik latar (file mp3 / YouTube)
js/script.js         cover, countdown, buku tamu
js/gallery.js        lightbox & carousel 3D
js/desktop.js        efek khusus desktop
css/, img/, nadin.mp3
```

## Yang belum dijadikan konfigurasi

- **Warna tema**: masih biru (kelas Tailwind `blue-*`, `sky-*` dan warna di `tailwind.config.js` / `css/style.css`).
- **Teks bawaan** (ayat Ar-Rum, kalimat pembuka, doa penutup) masih tertulis langsung di `index.html`. Ubah di sana bila pasangan berbeda agama/tradisi.
