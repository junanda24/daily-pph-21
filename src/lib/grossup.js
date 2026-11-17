import { hitungPPh21Bulanan } from './ter.js';

// Gross-up: pajak ditanggung perusahaan. Cari tunjangan pajak t sehingga
// PPh21(bruto + t) = t. Iterasi fixed-point; TER adalah fungsi tangga naik,
// jadi konvergen dalam beberapa langkah untuk semua rentang praktis.
export function hitungGrossUp({ bruto, ptkp, punyaNpwp = true }) {
  let tunjanganPajak = hitungPPh21Bulanan({ bruto, ptkp, punyaNpwp }).pph21;
  let iterasi = 1;
  const MAKS_ITERASI = 100;
  while (iterasi < MAKS_ITERASI) {
    const berikutnya = hitungPPh21Bulanan({
      bruto: bruto + tunjanganPajak,
      ptkp,
      punyaNpwp,
    }).pph21;
    iterasi += 1;
    if (Math.abs(berikutnya - tunjanganPajak) <= 1) {
      tunjanganPajak = berikutnya;
      break;
    }
    tunjanganPajak = berikutnya;
  }
  if (iterasi >= MAKS_ITERASI) {
    throw new Error(
      `Gross-up tidak konvergen setelah ${MAKS_ITERASI} iterasi ` +
        `(bruto ${bruto}, PTKP ${ptkp}). Coba periksa kembali input.`,
    );
  }
  const brutoKotor = bruto + tunjanganPajak;
  const { pph21 } = hitungPPh21Bulanan({ bruto: brutoKotor, ptkp, punyaNpwp });
  return {
    bruto,
    ptkp,
    tunjanganPajak,
    brutoKotor,
    pph21,
    gajiBersih: bruto,
    iterasi,
  };
}
