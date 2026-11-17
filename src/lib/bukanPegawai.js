import { FAKTOR_TANPA_NPWP } from '../data/progresif.js';
import { assertRupiah, bulatRupiah } from './validate.js';
import { hitungProgresif } from './tahunan.js';

// Bukan pegawai, pembayaran sekali (tidak berkesinambungan):
// DPP = 50% × penghasilan bruto, lalu tarif progresif Pasal 17 atas DPP.
export function hitungBukanPegawai({ bruto, punyaNpwp = true }) {
  assertRupiah(bruto, 'bruto');
  const dasarPengenaan = Math.floor(bruto / 2);
  const { lapisan, total } = hitungProgresif(dasarPengenaan);
  const pph21 = punyaNpwp ? total : bulatRupiah(total * FAKTOR_TANPA_NPWP);
  return {
    bruto,
    dasarPengenaan,
    lapisan,
    pph21,
    tanpaNpwp: !punyaNpwp,
  };
}
