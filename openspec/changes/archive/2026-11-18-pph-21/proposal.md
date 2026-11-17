# Proposal — pph-21 (2026-11-18)

## Apa ini

**`pph-21`** — library JavaScript zero-dependency untuk menghitung PPh Pasal 21
Indonesia sesuai aturan yang berlaku sejak 1 Januari 2024: **PP 58/2023** dan
**PMK 168/2023** (metode TER), plus tarif progresif Pasal 17 **UU HPP 7/2021**
untuk hitungan tahunan. Satu import, semua rumus pajak gaji karyawan beres.

## Kenapa ide ini mengejutkan

Setiap developer payroll/HR di Indonesia menulis ulang tabel TER dari PDF
peraturan — 125 baris tarif di tiga tabel (A/B/C) yang rawan salah ketik satu
angka saja. Library ini membawa **seluruh tabel resmi TER (125 lapisan,
lengkap, terverifikasi silang dari Lampiran PP 58/2023)** plus hitungan
tahunan, rekonsiliasi Desember, gross-up, dan PTKP lengkap — dalam satu
package tanpa dependency. Efek kejutnya: "kok kepikiran bikin library pajak?"
— karena memang belum ada package npm yang merangkum TER lengkap + tahunan +
gross-up sekaligus dengan test yang mengunci angka-angka resmi DJP.

## Kenapa bentuk output ini (npm package)

- Rotasi program: kemarin web app (WARIS!), npm terakhir 9 Nov (qris-id).
  Hari ini giliran package — bentuk yang memang paling pas: developer butuh
  ini sebagai dependency, bukan sebagai halaman web.
- Masalahnya murni komputasi deterministik dari tabel resmi: tidak butuh
  backend, tidak butuh login, tidak butuh API key.
- API yang enak dipakai = nilai utamanya; satu package yang bisa dipakai di
  Node, payroll internal, sampai script slip gaji.

## Kenapa tidak pakai backend

Semua input (bruto, status PTKP) dan semua tabel bersifat statis dan publik.
Tidak ada data yang harus disimpan di server, tidak ada secret. Client-side /
library murni adalah arsitektur yang benar — backend hanya menambah biaya
tanpa manfaat.

## Fitur (ringkas)

1. PPh 21 bulanan metode TER (Jan–Nov) — kategori A/B/C otomatis dari status PTKP.
2. PPh 21 harian (pegawai tidak tetap) — tarif efektif harian PMK 168/2023.
3. PPh 21 tahunan progresif Pasal 17 — biaya jabatan, iuran pensiun, PTKP,
   PKP dibulatkan ke bawah ke ribuan penuh.
4. Rekonsiliasi Desember (PMK 168 Pasal 15).
5. Gross-up (pajak ditanggung perusahaan) — iterasi sampai konvergen ≤ Rp1.
6. Bukan pegawai (sekali bayar) — DPP 50% × tarif Pasal 17.
7. PTKP lengkap 12 status (TK/0–TK/3, K/0–K/3, K/I/0–K/I/3).
8. Surcharge +20% untuk WP tanpa NPWP.
9. CLI kecil (`pph21`) untuk hitung cepat dari terminal.
10. Semua tabel diekspor mentah (`TER_A`, `TER_B`, `TER_C`, `PTKP`,
    `TARIF_PROGRESIF`) — transparan, bisa diaudit siapa pun.

## Bukan nasihat pajak

Package ini alat hitung edukasi/pengembangan. Angka bersumber dari peraturan
di atas; untuk bukti potong resmi tetap rujuk DJP / konsultan pajak. README
dan JSDoc menyatakan ini dengan jelas.

## Anti-AI-slop

Copy README + pesan error ditulis Bahasa Indonesia natural, spesifik, tanpa
frasa generik ("seamless", "cutting-edge", "revolutionary"). Contoh error
menyebutkan nilai yang salah dan nilai yang benar.

## IP check

Tidak ada aset pihak ketiga. Semua data berupa angka dari peraturan
perundang-undangan publik (PP 58/2023, PMK 168/2023, PMK 101/2016, UU HPP) —
bukan karya berhak cipta. Tidak ada logo, gambar, atau teks DJP yang disalin.

## Kepatuhan

- `CODE_STANDARDS.md`: ESM, ESLint airbnb-base + Prettier, `npm run lint`,
  tanpa file >300 baris, tanpa `console.log` di library.
- `ARCHITECTURE.md`: data (tabel) terpisah dari logika; modul kecil per
  fungsi; tanpa god module; error deskriptif (TypeError/RangeError).
- Aturan keras: tanpa credential dalam bentuk apa pun (tidak ada yang perlu
  dirahasiakan di package ini).
