/**
 * BACKEND GOOGLE APPS SCRIPT DENGAN FITUR LOVE & ID
 * Undangan Pernikahan: Buku Tamu & RSVP (Ihsan & Ai Liana)
 * Mendukung: ID Unik, Timestamp, Nama, Kehadiran, Jumlah Tamu, Ucapan, dan Counter Love
 */

const SHEET_NAME = "BukuTamu";

// Urutan kolom standar untuk sheet baru
const STANDARD_HEADERS = [
  "ID",
  "Timestamp",
  "Nama",
  "Kehadiran",
  "Jumlah Tamu",
  "Ucapan",
  "Love",
];

/**
 * Handle GET Request: Mengambil data komentar/ucapan tamu
 * atau fallback aksi love via URL parameter (?action=love&id=...)
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();

    // Fallback: Jika ada aksi love via parameter GET
    if (e && e.parameter && e.parameter.action === "love" && e.parameter.id) {
      return handleLoveAction(sheet, e.parameter.id);
    }

    const data = sheet.getDataRange().getValues();

    // Jika sheet masih kosong atau hanya berisi baris header
    if (data.length <= 1) {
      return createJsonResponse({
        status: "success",
        data: [],
      });
    }

    const colMap = resolveColumnMap(sheet);
    const rows = data.slice(1);

    const messages = rows.map((row, index) => {
      let dateValue = row[colMap.timestamp];
      if (dateValue instanceof Date) {
        dateValue = dateValue.toISOString();
      } else if (dateValue) {
        try {
          dateValue = new Date(dateValue).toISOString();
        } catch (err) {
          dateValue = new Date().toISOString();
        }
      } else {
        dateValue = new Date().toISOString();
      }

      // Pastikan setiap baris memiliki ID
      let idValue = String(row[colMap.id] || "").trim();
      if (!idValue) {
        idValue = "msg_" + new Date(dateValue).getTime() + "_" + (index + 1);
      }

      return {
        id: idValue,
        timestamp: dateValue,
        nama: String(row[colMap.nama] || ""),
        kehadiran: String(row[colMap.kehadiran] || ""),
        jumlah_tamu: String(row[colMap.jumlahTamu] || "-"),
        ucapan: String(row[colMap.ucapan] || ""),
        love: Number(row[colMap.love] || 0),
      };
    });

    // Kembalikan data ucapan dalam urutan kronologis (karena client-side index_3.html membalik urutan sendiri)
    return createJsonResponse({
      status: "success",
      data: messages,
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString(),
    });
  }
}

/**
 * Handle POST Request: Menyimpan ucapan tamu baru atau menambah Love
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  // Kunci eksekusi hingga 10 detik agar penambahan love/komentar tidak bentrok
  lock.tryLock(10000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Payload tidak ditemukan atau kosong.");
    }

    const payload = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    // 1. Tangani Aksi LOVE / LIKE
    if (payload.action === "love") {
      const targetId = String(payload.id || "").trim();
      if (!targetId) {
        throw new Error("ID ucapan untuk love tidak disertakan.");
      }
      return handleLoveAction(sheet, targetId);
    }

    // 2. Tangani Form Buku Tamu Baru
    const nama = (payload.nama || "").trim();
    const kehadiran = (payload.kehadiran || "").trim();
    const jumlahTamu = (
      payload.jumlah_tamu ||
      payload.jumlahTamu ||
      "1"
    ).trim();
    const ucapan = (payload.ucapan || "").trim();

    if (!nama || !kehadiran || !ucapan) {
      throw new Error("Nama, kehadiran, dan ucapan wajib diisi.");
    }

    const colMap = resolveColumnMap(sheet);
    const timestamp = new Date();
    // Buat ID unik berbasis timestamp dan angka acak
    const newId =
      "msg_" + timestamp.getTime() + "_" + Math.floor(Math.random() * 10000);
    const initialLove = 0;

    // Susun baris sesuai pemetaan kolom yang aktif
    const numCols = Math.max(...Object.values(colMap)) + 1;
    const newRow = new Array(numCols).fill("");

    newRow[colMap.id] = newId;
    newRow[colMap.timestamp] = timestamp;
    newRow[colMap.nama] = nama;
    newRow[colMap.kehadiran] = kehadiran;
    newRow[colMap.jumlahTamu] = jumlahTamu;
    newRow[colMap.ucapan] = ucapan;
    newRow[colMap.love] = initialLove;

    sheet.appendRow(newRow);

    return createJsonResponse({
      status: "success",
      message: "Ucapan berhasil dikirim!",
      id: newId,
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString(),
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper: Menambah 1 poin love untuk ucapan dengan ID yang cocok
 */
function handleLoveAction(sheet, targetId) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    throw new Error("Data ucapan masih kosong.");
  }

  const colMap = resolveColumnMap(sheet);
  let foundRowIndex = -1;
  let currentLove = 0;

  // Cari baris yang cocok berdasarkan kolom ID (atau fallback timestamp/nama jika ID kosong)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowId = String(row[colMap.id] || "").trim();
    const rowTimestamp =
      row[colMap.timestamp] instanceof Date
        ? row[colMap.timestamp].toISOString()
        : String(row[colMap.timestamp] || "");

    if (rowId === targetId || rowTimestamp === targetId) {
      foundRowIndex = i + 1; // 1-based index untuk range Sheets
      currentLove = Number(row[colMap.love] || 0);
      break;
    }
  }

  if (foundRowIndex === -1) {
    throw new Error("Ucapan dengan ID " + targetId + " tidak ditemukan.");
  }

  const updatedLove = currentLove + 1;
  sheet.getRange(foundRowIndex, colMap.love + 1).setValue(updatedLove);

  return createJsonResponse({
    status: "success",
    message: "Love berhasil ditambahkan.",
    id: targetId,
    love: updatedLove,
  });
}

/**
 * Helper: Ambil tab sheet atau buat otomatis bila belum ada
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(STANDARD_HEADERS);
    sheet.getRange("A1:G1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Helper: Menentukan indeks kolom secara dinamis dan melakukan upgrade otomatis
 * jika sheet sudah memiliki data lama tanpa kolom ID atau Love
 */
function resolveColumnMap(sheet) {
  let headers = sheet
    .getRange(1, 1, 1, Math.max(1, sheet.getLastColumn()))
    .getValues()[0];
  let headerLower = headers.map((h) =>
    String(h || "")
      .toLowerCase()
      .trim(),
  );

  let hasId = headerLower.some((h) => h === "id");
  let hasLove = headerLower.some(
    (h) => h.includes("love") || h.includes("like"),
  );

  // Jika kolom ID belum ada, tambahkan ke header
  if (!hasId) {
    const nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue("ID").setFontWeight("bold");
    headers.push("ID");
    headerLower.push("id");

    // Isi ID otomatis untuk baris-baris lama yang belum punya ID
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const timestamps = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      const idValues = timestamps.map((t, idx) => {
        const timeVal =
          t[0] instanceof Date
            ? t[0].getTime()
            : Date.now() - (lastRow - idx) * 1000;
        return ["msg_" + timeVal + "_" + (idx + 1)];
      });
      sheet.getRange(2, nextCol, lastRow - 1, 1).setValues(idValues);
    }
  }

  // Jika kolom Love belum ada, tambahkan ke header
  if (!hasLove) {
    const nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue("Love").setFontWeight("bold");
    headers.push("Love");
    headerLower.push("love");

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const zeroValues = new Array(lastRow - 1).fill([0]);
      sheet.getRange(2, nextCol, lastRow - 1, 1).setValues(zeroValues);
    }
  }

  // Petakan index kolom secara fleksibel
  return {
    id: headerLower.indexOf("id"),
    timestamp: headerLower.findIndex(
      (h) =>
        h.includes("timestamp") || h.includes("waktu") || h.includes("tanggal"),
    ),
    nama: headerLower.findIndex((h) => h.includes("nama")),
    kehadiran: headerLower.findIndex(
      (h) => h.includes("kehadiran") || h.includes("status"),
    ),
    jumlahTamu: headerLower.findIndex(
      (h) => h.includes("jumlah") || h.includes("tamu"),
    ),
    ucapan: headerLower.findIndex(
      (h) => h.includes("ucapan") || h.includes("pesan") || h.includes("doa"),
    ),
    love: headerLower.findIndex(
      (h) => h.includes("love") || h.includes("like"),
    ),
  };
}

/**
 * Helper: Mengembalikan respons JSON standar
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
