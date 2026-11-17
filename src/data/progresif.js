// Tarif progresif PPh Pasal 17 ayat (1) huruf a UU PPh,
// sebagaimana diubah UU HPP Nomor 7 Tahun 2021.
// Format: [batasAtasPkp, tarifPersen]. Batas atas inklusif.
export const TARIF_PROGRESIF = Object.freeze([
  [60000000, 5],
  [250000000, 15],
  [500000000, 25],
  [5000000000, 30],
  [Infinity, 35],
]);

// Tarif efektif harian (PMK 168/2023) untuk pegawai tidak tetap.
// Format: [batasAtasBrutoHarian, tarifPersen].
export const TER_HARIAN = Object.freeze([
  [450000, 0],
  [2500000, 0.5],
]);

// Batas biaya jabatan: 5% dari penghasilan bruto, maksimal
// Rp500.000/bulan = Rp6.000.000/setahun.
export const BIAYA_JABATAN_PERSEN = 5;
export const BIAYA_JABATAN_MAKS_SETAHUN = 6000000;

// Batas atas tabel harian resmi: di atas Rp2.500.000/hari bukan kasus harian.
export const BRUTO_HARIAN_MAKS = 2500000;

// WP tanpa NPWP: tarif dikenakan 20% lebih tinggi (Pasal 21 UU PPh).
export const FAKTOR_TANPA_NPWP = 1.2;
