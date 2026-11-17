// PTKP (Penghasilan Tidak Kena Pajak) setahun — PMK 101/PMK.010/2016.
// Masih berlaku untuk tahun pajak 2026 (belum ada perubahan sejak 2016).
// TK = tidak kawin, K = kawin, K/I = kawin dengan penghasilan istri digabung,
// angka = jumlah tanggungan (maksimal 3).

export const PTKP = Object.freeze({
  'TK/0': 54000000,
  'TK/1': 58500000,
  'TK/2': 63000000,
  'TK/3': 67500000,
  'K/0': 58500000,
  'K/1': 63000000,
  'K/2': 67500000,
  'K/3': 72000000,
  'K/I/0': 112500000,
  'K/I/1': 117000000,
  'K/I/2': 121500000,
  'K/I/3': 126000000,
});

// Status PTKP → kategori TER (Lampiran PMK 168/2023).
// Status K/I TIDAK punya kategori TER: penggabungan penghasilan istri
// hanya memengaruhi SPT Tahunan, bukan pemotongan bulanan pemberi kerja.
export const KATEGORI_TER = Object.freeze({
  'TK/0': 'A',
  'TK/1': 'A',
  'K/0': 'A',
  'TK/2': 'B',
  'TK/3': 'B',
  'K/1': 'B',
  'K/2': 'B',
  'K/3': 'C',
});

export const STATUS_PTKP = Object.freeze(Object.keys(PTKP));
