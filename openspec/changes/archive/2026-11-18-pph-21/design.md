# Design — pph-21

## Stack

- Bahasa: JavaScript murni (ESM), Node >= 18. Tanpa TypeScript build step —
  pola yang sama dengan `kata-angka` (daily 2026-10-31): cepat, zero-dep,
  mudah diaudit. Type definitions ditulis tangan di `src/index.d.ts`.
- Test: `node:test` + `node:assert/strict` bawaan Node (tanpa dependency).
- Lint: ESLint 9 flat config + `eslint-config-airbnb-base`, Prettier 3.
  `npm run lint` = eslint + prettier --check.
- CLI: `bin/pph21.js` dengan shebang `node`, parsing argumen manual
  (zero-dep, tanpa commander).

## Struktur (ikut ARCHITECTURE.md: data terpisah dari logika, modul kecil)

```
pph-21/
  src/
    index.js            # entry: re-export semua API publik (saja)
    index.d.ts          # type definitions
    data/
      ter.js            # TER_A (44), TER_B (40), TER_C (41) — [batasAtas, tarif%]
      ptkp.js           # PTKP 11 status + peta status → kategori TER
      progresif.js      # lapisan tarif Pasal 17 UU HPP
    lib/
      validate.js       # validasi angka/status (satu tempat)
      ter.js            # getKategoriTer, getTarifTer, hitungPPh21Bulanan/Harian
      tahunan.js        # hitungPPh21Tahunan, hitungDesember
      grossup.js        # hitungGrossUp (fixed-point)
      bukanPegawai.js   # hitungBukanPegawai
      format.js         # formatRupiah
  bin/
    pph21.js            # CLI tipis: parse arg → panggil lib → cetak
  test/
    ter.test.js         # R2, R3, R4, R5
    ptkp.test.js        # R1
    tahunan.test.js     # R6, R7
    grossup.test.js     # R8
    bukan-pegawai.test.js # R9
    validate.test.js    # R10
    data.test.js        # R11 (jumlah lapisan, monoton naik)
  examples/
    slip-gaji.js        # contoh: slip gaji bulanan + tahunan + Desember
    payroll-csv.js      # contoh: hitung massal dari array karyawan
```

Aturan file: tidak ada file >300 baris; `ter.js` data memang panjang tapi
hanya berisi literal array (bukan logika) — pengecualian yang dicatat di
sini, bukan god module.

## State (lima keranjang ARCHITECTURE.md)

Library murni fungsi tanpa state: tidak ada keranjang yang terpakai kecuali
konstanta data (modul `data/`). Tidak ada localStorage, tidak ada global
mutable. Semua fungsi pure: input sama → output sama, gampang di-test.

## Keputusan teknis penting

1. **Tarif disimpan sebagai persen di data, desimal di API.** Tabel resmi
   memakai persen (0,25% dst); data menyimpan persen apa adanya, fungsi
   `getTarifTer` mengembalikan desimal (0,0025) — konsisten dengan
   konvensi library pajak lain.
2. **Batas atas inklusif.** Tiap baris `[batasAtas, persen]` berarti
   "sampai dengan batasAtas". Lookup = baris pertama dengan
   `bruto <= batasAtas`; baris terakhir `Infinity`.
3. **Pembulatan PPh 21 bulanan/harian**: hasil perkalian dibulatkan ke rupiah
   penuh (Math.round — setengah ke atas). Dicatat di README karena DJP
   memakai pembulatan ke bawah pada bukti potong; library memakai round
   standar dan mendokumentasikannya.
4. **PKP dibulatkan ke bawah ke ribuan penuh** — sesuai UU PPh Pasal 17.
5. **Gross-up fixed-point**: mulai `t = PPh21(bruto)`, ulang
   `t = PPh21(bruto + t)` sampai `|t_baru − t| ≤ 1`. TER adalah fungsi
   tangga naik, jadi iterasi konvergen dalam <10 langkah untuk semua
   rentang praktis; batas 100 iterasi sebagai pengaman.
6. **K/I ditolak di TER** dengan pesan yang menjelaskan kenapa — bukan
   sekadar "invalid". Ini mencegah kesalahan payroll yang diam-diam salah.
7. **Harian >2,5jt ditolak** — tabel harian resmi hanya sampai 2,5jt/hari;
   melempar error jujur lebih baik daripada mengarang tarif.
8. **Tanpa NPWP = ×1,2** diterapkan di semua jalur (bulanan, harian,
   tahunan, bukan pegawai) lewat satu helper `terapkanNpwp`.

## Verifikasi angka (sumber)

- Tabel TER A/B/C: disalin dari Lampiran A–C PP 58/2023 via kalkulator
  Lab Nalar (nalarku.com/lab/pph-21, diperiksa 26 Okt 2026 terhadap PDF
  resmi JDIH Kemenkeu) — dicek silang jumlah lapisan (44/40/41) dan
  beberapa baris acak dengan online-pajak.com + akuntansimandiri.com.
- PTKP: PMK 101/2016, masih berlaku 2026 (dikonfirmasi pajakku.com,
  online-pajak.com, talenhunts.id).
- Progresif: UU HPP 7/2021 — 5/15/25/30/35%.
- Contoh uji: bruto 10jt K/0 → TER 2% → 200rb (contoh Lab Nalar);
  PKP 100jt → 9jt (contoh pajakku.com: 3jt + 4,5jt untuk PKP 90jt —
  diadaptasi).

## Risiko

- Peraturan bisa berubah (PTKP 2027 sedang dibahas). Mitigasi: nomor
  peraturan + tanggal pemeriksaan dicantumkan di README dan `data/`;
  versi package mengikuti tahun pajak.
