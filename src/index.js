// pph-21 — Hitung PPh Pasal 21 Indonesia.
// Dasar hukum: PP 58/2023, PMK 168/2023, PMK 101/2016, UU HPP 7/2021.
// Alat hitung edukasi/pengembangan, BUKAN nasihat pajak atau bukti potong.
export { TER_A, TER_B, TER_C } from './data/ter.js';
export { KATEGORI_TER, PTKP, STATUS_PTKP } from './data/ptkp.js';
export { TARIF_PROGRESIF, TER_HARIAN } from './data/progresif.js';
export {
  getKategoriTer,
  getPtkp,
  getTarifTer,
  hitungPPh21Bulanan,
  hitungPPh21Harian,
} from './lib/ter.js';
export {
  hitungDesember,
  hitungPPh21Tahunan,
  hitungProgresif,
} from './lib/tahunan.js';
export { hitungGrossUp } from './lib/grossup.js';
export { hitungBukanPegawai } from './lib/bukanPegawai.js';
export { formatRupiah } from './lib/format.js';
