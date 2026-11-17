# pph-21

Hitung **PPh Pasal 21 Indonesia** dari JavaScript — tarif efektif rata-rata
(TER) bulanan & harian, tarif progresif tahunan, rekonsiliasi Desember,
gross-up, dan PTKP lengkap. Zero dependency, Node ≥ 18.

## Kenapa package ini ada

Setiap developer payroll/HR di Indonesia menulis ulang tabel TER dari PDF
peraturan — 125 baris tarif di tiga tabel yang rawan salah ketik satu angka
saja. `pph-21` membawa **seluruh tabel resmi TER (125 lapisan, lengkap)** plus
hitungan tahunan, rekonsiliasi Desember, dan gross-up dalam satu API yang
bisa langsung dipakai di Node. Angka-angkanya dikunci oleh 56 test, termasuk
contoh resmi dari DJP.

> **Bukan nasihat pajak.** Ini alat hitung untuk pengembangan/edukasi. Untuk
> bukti potong resmi, tetap rujuk DJP atau konsultan pajak Anda.

## Install

```bash
npm i pph-21
```

Belum dipublish ke npm registry — install dari GitHub sampai ada keputusan
publish:

```bash
npm i github:junanda24/daily-pph-21
```

## Pakai

```js
import {
  hitungPPh21Bulanan,
  hitungPPh21Tahunan,
  hitungDesember,
  hitungGrossUp,
  getPtkp,
} from 'pph-21';

// Gaji Rp10.000.000/bulan, sudah menikah tanpa tanggungan (K/0):
// kategori TER A, tarif 2% → PPh 21 Rp200.000.
hitungPPh21Bulanan({ bruto: 10000000, ptkp: 'K/0' });
// → { bruto: 10000000, ptkp: 'K/0', kategori: 'A',
//     tarifTer: 0.02, tarifTerPersen: 2, pph21: 200000, tanpaNpwp: false }

// Hitungan setahun (progresif Pasal 17) — untuk rekonsiliasi Desember.
const tahunan = hitungPPh21Tahunan({ brutoSetahun: 120000000, ptkp: 'TK/0' });
// → { biayaJabatan: 6000000, penghasilanNeto: 114000000, pkp: 60000000,
//     pph21Setahun: 3000000, pph21PerBulan: 250000, ... }

// Desember = PPh 21 setahun − yang sudah dipotong Jan–Nov.
hitungDesember({ pph21Setahun: 9000000, sudahDipotong: 8200000 });
// → { pph21Desember: 800000, lebihPotong: 0 }

// Gross-up: pajak ditanggung perusahaan, gaji bersih tetap Rp10.000.000.
hitungGrossUp({ bruto: 10000000, ptkp: 'K/0' });
// → { tunjanganPajak: 230179, brutoKotor: 10230179, pph21: 230179, ... }

getPtkp('K/I/0'); // 112500000
```

## API

| Fungsi                                                                | Keterangan                                        |
| --------------------------------------------------------------------- | ------------------------------------------------- |
| `hitungPPh21Bulanan({ bruto, ptkp, punyaNpwp })`                      | PPh 21 bulanan pegawai tetap, masa Jan–Nov (TER). |
| `hitungPPh21Harian({ brutoHarian, punyaNpwp })`                       | PPh 21 harian pegawai tidak tetap (TER harian).   |
| `hitungPPh21Tahunan({ brutoSetahun, iuranPensiun, ptkp, punyaNpwp })` | PPh 21 setahun, tarif progresif Pasal 17.         |
| `hitungDesember({ pph21Setahun, sudahDipotong })`                     | Rekonsiliasi masa pajak terakhir (Desember).      |
| `hitungGrossUp({ bruto, ptkp, punyaNpwp })`                           | Tunjangan pajak (pajak ditanggung perusahaan).    |
| `hitungBukanPegawai({ bruto, punyaNpwp })`                            | Bukan pegawai, sekali bayar (DPP 50% × bruto).    |
| `getPtkp(status)`                                                     | PTKP setahun untuk 12 status.                     |
| `getKategoriTer(status)`                                              | Kategori TER (`A`/`B`/`C`) dari status PTKP.      |
| `getTarifTer(brutoBulanan, ptkp)`                                     | Tarif TER desimal + persen untuk satu bruto.      |
| `hitungProgresif(pkp)`                                                | Pajak progresif Pasal 17 atas PKP, per lapisan.   |
| `formatRupiah(nilai)`                                                 | `10000000` → `"Rp10.000.000"`.                    |

Semua fungsi mengembalikan objek yang memuat rincian hitungan (kategori,
tarif, lapisan progresif, dsb.) — bukan cuma angka akhir.

### Status PTKP

`TK/0` `TK/1` `TK/2` `TK/3` `K/0` `K/1` `K/2` `K/3`
`K/I/0` `K/I/1` `K/I/2` `K/I/3` — nilai sesuai PMK 101/2016
(TK/0 Rp54.000.000, +Rp4.500.000 per tanggungan/status kawin,
K/I/0 Rp112.500.000).

### Tanpa NPWP

Semua fungsi hitung menerima `punyaNpwp: false` → hasil dikali 1,2
(surcharge 20%, Pasal 21 UU PPh) dan mengembalikan `tanpaNpwp: true`.

### Data mentah (transparan, bisa diaudit)

```js
import { TER_A, TER_B, TER_C, PTKP, TARIF_PROGRESIF } from 'pph-21';
// TER_A: 44 lapisan, TER_B: 40, TER_C: 41 — [batasAtas, tarifPersen].
```

## CLI

```bash
npx pph21 bulanan --bruto 10000000 --ptkp K/0
npx pph21 tahunan --bruto 120000000 --ptkp TK/0 [--iuran 2400000]
npx pph21 harian --bruto 1000000
npx pph21 grossup --bruto 10000000 --ptkp K/0
npx pph21 bukan-pegawai --bruto 10000000
# tambah --tanpa-npwp untuk surcharge 20%, --json untuk output JSON
```

## Aturan hitung yang dipakai

- **TER bulanan** (PP 58/2023 Lampiran A–C, berlaku 1 Jan 2024): PPh 21 =
  bruto × tarif TER. Dipakai Jan–Nov; Desember direkonsiliasi progresif.
- **TER harian** (PMK 168/2023): bruto ≤ Rp450.000 → 0%;
  Rp450.000–Rp2.500.000 → 0,5%.
- **Tahunan** (UU HPP 7/2021): biaya jabatan 5% dari bruto (maks
  Rp6.000.000/thn), dikurangi iuran pensiun → penghasilan neto → dikurangi
  PTKP → PKP **dibulatkan ke bawah ke ribuan penuh** → tarif progresif
  5% (≤60jt), 15% (60–250jt), 25% (250–500jt), 30% (500jt–5M),
  35% (>5M).
- **Desember** (PMK 168/2023 Pasal 15): PPh 21 setahun − potongan Jan–Nov.
- **Bukan pegawai** (sekali bayar): DPP = 50% × bruto, lalu progresif.
- **Pembulatan**: PPh 21 bulanan/harian dibulatkan ke rupiah penuh
  (setengah ke atas). PKP dibulatkan ke bawah ke ribuan penuh.

## Batasan yang disengaja

- **Status K/I ditolak di TER** (`getKategoriTer('K/I/0')` melempar
  `RangeError`): status K/I tidak punya kategori TER — penggabungan
  penghasilan istri hanya memengaruhi SPT Tahunan, bukan pemotongan
  bulanan pemberi kerja. Pakai `K/0`–`K/3` untuk hitungan bulanan.
- **Bruto harian di atas Rp2.500.000 ditolak**: tabel harian resmi hanya
  mencakup sampai Rp2.500.000/hari.
- **Tidak menghitung**: masa pajak terakhir pegawai yang berhenti di
  tengah tahun (pakai `hitungPPh21Tahunan` + `hitungDesember` dengan
  penyesuaian manual), pegawai dengan fasilitas DTP, dan PPh 26.
- **PTKP 2027**: pemerintah sedang membahas kenaikan PTKP; angka di sini
  mengacu PMK 101/2016 yang masih berlaku untuk tahun pajak 2026.
  Kalau PMK baru terbit, package ini perlu rilis mayor/minor baru.

## Mengembangkan dari source

```bash
git clone https://github.com/junanda24/daily-pph-21.git
cd daily-pph-21
npm install
npm test        # node:test, 56 test
npm run lint    # ESLint 9 + Prettier
node bin/pph21.js bulanan --bruto 10000000 --ptkp K/0
node examples/slip-gaji.js
```

## Tech stack

JavaScript murni (ESM), Node ≥ 18, zero dependency. Test: `node:test`
bawaan Node. Lint: ESLint 9 (`@eslint/js` recommended +
`eslint-plugin-import`) + Prettier 3. Type definitions ditulis tangan
(`src/index.d.ts`).

Catatan lint: `eslint-config-airbnb-base@15` hanya mendukung ESLint 7/8,
jadi package ini memakai `@eslint/js` recommended di ESLint 9 — aturan
intinya sama (lihat `eslint.config.js`).

## Struktur folder

```
pph-21/
  src/
    index.js            # entry point, re-export API publik
    index.d.ts          # type definitions
    data/
      ter.js            # tabel TER A (44), B (40), C (41) — PP 58/2023
      ptkp.js           # PTKP 12 status + peta status → kategori TER
      progresif.js      # lapisan Pasal 17, TER harian, konstanta
    lib/
      validate.js       # validasi input + pembulatan
      ter.js            # TER bulanan/harian, getPtkp, getKategoriTer
      tahunan.js        # progresif tahunan + rekonsiliasi Desember
      grossup.js        # gross-up (fixed-point)
      bukanPegawai.js   # bukan pegawai sekali bayar
      format.js         # formatRupiah
  bin/pph21.js          # CLI
  test/                 # 7 file test, 56 test (node:test)
  examples/
    slip-gaji.js        # slip gaji: bulanan + tahunan + Desember
    payroll-csv.js      # hitung massal banyak karyawan
```

## Sumber angka

- PP Nomor 58 Tahun 2023, Lampiran A–C (tabel TER) — via JDIH Kemenkeu.
- PMK Nomor 168 Tahun 2023 (petunjuk teknis, TER harian, Desember).
- PMK Nomor 101/PMK.010/2016 (PTKP, masih berlaku 2026).
- UU Nomor 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan (tarif
  progresif Pasal 17).
- Angka diperiksa 2026-11-18 dan dicek silang dengan kalkulator Lab Nalar,
  online-pajak.com, dan akuntansimandiri.com.

## Link

- Repo: https://github.com/junanda24/daily-pph-21
- Rilis: 2026-11-18 (v1.0.0)

## Lisensi

MIT — lihat `LICENSE`.
