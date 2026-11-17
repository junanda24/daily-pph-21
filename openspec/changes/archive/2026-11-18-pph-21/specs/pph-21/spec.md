# Spec — pph-21

Library hitung PPh Pasal 21 Indonesia (PP 58/2023, PMK 168/2023, PMK
101/2016, UU HPP 7/2021). Zero dependency, Node >= 18, ESM + type definitions.

## Terminologi

- **Bruto**: penghasilan bruto kena potong (gaji + tunjangan + THR/bonus pada
  bulan yang sama).
- **PTKP**: Penghasilan Tidak Kena Pajak setahun menurut status (PMK 101/2016).
- **TER**: Tarif Efektif Rata-rata — tarif bulanan dari tabel Lampiran PP
  58/2023, dipakai Jan–Nov untuk pegawai tetap.
- **PKP**: Penghasilan Kena Pajak = penghasilan neto − PTKP, dibulatkan ke
  bawah ke ribuan penuh.

## Requirements

### R1 — Tabel PTKP lengkap

- SHALL: `getPtkp(status)` mengembalikan PTKP setahun untuk 12 status:
  TK/0 54.000.000, TK/1 58.500.000, TK/2 63.000.000, TK/3 67.500.000,
  K/0 58.500.000, K/1 63.000.000, K/2 67.500.000, K/3 72.000.000,
  K/I/0 112.500.000, K/I/1 117.000.000, K/I/2 121.500.000, K/I/3 126.000.000.
- WHEN status tidak dikenal THEN throw `RangeError` yang menyebutkan status
  yang diterima dan daftar status yang valid.

### R2 — Kategori TER dari status PTKP

- SHALL: `getKategoriTer(status)` memetakan TK/0, TK/1, K/0 → `A`;
  TK/2, TK/3, K/1, K/2 → `B`; K/3 → `C`.
- WHEN status K/I/0–K/I/3 THEN throw `RangeError` — status K/I tidak punya
  kategori TER (hanya dipakai di SPT Tahunan gabungan, bukan pemotongan
  bulanan pemberi kerja).
- WHEN status tidak dikenal THEN throw `RangeError`.

### R3 — Tarif TER bulanan (125 lapisan)

- SHALL: `getTarifTer(brutoBulanan, status)` mengembalikan tarif desimal
  (mis. `0.02` untuk 2%) dari tabel resmi: A 44 lapisan, B 40 lapisan,
  C 41 lapisan; batas atas tiap lapisan inklusif.
- WHEN bruto = 5.400.000 dan status TK/0 THEN tarif 0.
- WHEN bruto = 5.400.001 dan status TK/0 THEN tarif 0,0025.
- WHEN bruto = 10.000.000 dan status K/0 THEN tarif 0,02.
- WHEN bruto = 8.000.000 dan status TK/0 THEN tarif 0,015.
- WHEN bruto di atas lapisan tertinggi THEN tarif 0,34.
- WHEN bruto negatif / bukan angka berhingga THEN throw `RangeError` /
  `TypeError`.

### R4 — PPh 21 bulanan (Jan–Nov)

- SHALL: `hitungPPh21Bulanan({ bruto, ptkp, punyaNpwp = true })`
  mengembalikan `{ bruto, ptkp, kategori, tarifTer, pph21 }` dengan
  `pph21 = bruto × tarifTer`, dibulatkan ke rupiah penuh (pembulatan
  setengah ke atas).
- WHEN bruto 10.000.000, ptkp K/0 THEN pph21 = 200.000.
- WHEN `punyaNpwp` false THEN pph21 dikali 1,2 (surcharge 20%) dan hasil
  memuat `tanpaNpwp: true`.

### R5 — PPh 21 harian (pegawai tidak tetap)

- SHALL: `hitungPPh21Harian({ brutoHarian, punyaNpwp = true })` memakai
  tarif efektif harian PMK 168/2023: bruto ≤ 450.000 → 0%;
  450.000 < bruto ≤ 2.500.000 → 0,5%.
- WHEN bruto 400.000 THEN pph21 = 0.
- WHEN bruto 1.000.000 THEN pph21 = 5.000.
- WHEN bruto > 2.500.000 THEN throw `RangeError` — tabel harian resmi hanya
  mencakup sampai Rp2.500.000/hari (di atas itu bukan kasus harian).
- WHEN `punyaNpwp` false THEN pph21 dikali 1,2.

### R6 — PPh 21 tahunan progresif Pasal 17

- SHALL: `hitungPPh21Tahunan({ brutoSetahun, iuranPensiun = 0, ptkp,
  punyaNpwp = true })` menghitung:
  - biaya jabatan = min(5% × brutoSetahun, 6.000.000),
  - penghasilan neto = bruto − biaya jabatan − iuran pensiun,
  - PKP = max(0, floor((neto − PTKP) / 1000) × 1000),
  - pajak progresif per lapisan: 5% (s.d. 60jt), 15% (60–250jt),
    25% (250–500jt), 30% (500jt–5M), 35% (>5M),
  - mengembalikan `{ brutoSetahun, biayaJabatan, iuranPensiun,
    penghasilanNeto, ptkp, pkp, lapisan: [{ batasAtas, tarif, dasar, pajak }],
    pph21Setahun, pph21PerBulan }`.
- WHEN PKP 100.000.000 THEN pph21Setahun = 9.000.000
  (5% × 60jt + 15% × 40jt).
- WHEN PKP 60.000.000 THEN pph21Setahun = 3.000.000.
- WHEN neto ≤ PTKP THEN pkp = 0 dan pph21Setahun = 0.
- WHEN `punyaNpwp` false THEN pph21Setahun dikali 1,2.

### R7 — Rekonsiliasi Desember

- SHALL: `hitungDesember({ pph21Setahun, sudahDipotong })` mengembalikan
  `{ pph21Desember, lebihPotong }` dengan
  `pph21Desember = max(0, pph21Setahun − sudahDipotong)` dan
  `lebihPotong = max(0, sudahDipotong − pph21Setahun)`.
- WHEN pph21Setahun 9.000.000 dan sudahDipotong 8.200.000 THEN
  pph21Desember = 800.000, lebihPotong = 0.

### R8 — Gross-up (pajak ditanggung perusahaan)

- SHALL: `hitungGrossUp({ bruto, ptkp, punyaNpwp = true })` mencari
  tunjangan pajak `t` sehingga `hitungPPh21Bulanan(bruto + t) = t`,
  iterasi fixed-point sampai selisih ≤ Rp1 (maks 100 iterasi),
  mengembalikan `{ tunjanganPajak, brutoKotor, pph21, iterasi }`.
- WHEN bruto 10.000.000, ptkp K/0 THEN tunjanganPajak = 230.179
  (bruto kotor 10.230.179 × 2,25% = 230.179) dan `brutoKotor − tunjanganPajak`
  sama dengan bruto awal. (Perhatian: bruto kotor melewati batas lapisan
  10.050.000 sehingga tarif naik dari 2% ke 2,25% — inilah alasan gross-up
  harus iterasi, bukan sekali hitung.)
- WHEN tidak konvergen dalam 100 iterasi THEN throw `Error` yang jelas.

### R9 — Bukan pegawai (sekali bayar)

- SHALL: `hitungBukanPegawai({ bruto, punyaNpwp = true })` menghitung
  DPP = 50% × bruto, lalu tarif progresif Pasal 17 atas DPP,
  mengembalikan `{ bruto, dasarPengenaan, lapisan, pph21 }`.
- WHEN bruto 10.000.000 THEN dasarPengenaan = 5.000.000, pph21 = 250.000.
- WHEN `punyaNpwp` false THEN pph21 dikali 1,2.

### R10 — Validasi input

- SHALL: semua fungsi publik menolak input bukan angka / NaN / negatif
  (untuk nominal uang) dengan `TypeError` / `RangeError` yang menyebutkan
  nama parameter dan nilai yang diterima.
- SHALL: tidak ada fungsi yang menelan error diam-diam atau mengembalikan
  `NaN`.

### R11 — Data transparan

- SHALL: tabel mentah diekspor sebagai `TER_A`, `TER_B`, `TER_C` (array
  `[batasAtas, tarifPersen]`), `PTKP` (map status → rupiah), dan
  `TARIF_PROGRESIF` (array lapisan Pasal 17).
- SHALL: jumlah lapisan TER_A = 44, TER_B = 40, TER_C = 41.

### R12 — Packaging

- SHALL: package ESM (`"type": "module"`), Node >= 18, zero dependency,
  `main` + `exports` + `types` mengarah ke `src/index.js` /
  `src/index.d.ts`, `files: ["src", "bin"]`.
- SHALL: `npm test` (node:test) hijau, `npm pack --dry-run` sukses,
  `npm run lint` (ESLint airbnb-base + Prettier) bersih.
- SHALL: CLI `bin/pph21.js` — `pph21 bulanan --bruto <n> --ptkp <status>`
  dan `pph21 tahunan --bruto <n> --ptkp <status>` mencetak hasil sebagai
  JSON / tabel ringkas ke stdout dan keluar dengan kode 0; argumen tidak
  valid → pesan ke stderr + kode keluar 1.
