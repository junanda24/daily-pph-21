# Changelog

## 1.0.0 — 2026-11-18

Rilis awal.

- PPh 21 bulanan metode TER (PP 58/2023): tabel lengkap A (44 lapisan),
  B (40), C (41), kategori otomatis dari status PTKP.
- PPh 21 harian pegawai tidak tetap (PMK 168/2023).
- PPh 21 tahunan progresif Pasal 17 (UU HPP): biaya jabatan, iuran
  pensiun, PKP dibulatkan ke bawah ke ribuan penuh.
- Rekonsiliasi Desember (PMK 168/2023 Pasal 15).
- Gross-up (pajak ditanggung perusahaan), iterasi fixed-point.
- Bukan pegawai sekali bayar (DPP 50% × bruto).
- PTKP lengkap 12 status (PMK 101/2016), surcharge +20% tanpa NPWP.
- CLI `pph21` (bulanan/tahunan/harian/grossup/bukan-pegawai).
- 56 test hijau (`node:test`), ESLint 9 + Prettier bersih.
