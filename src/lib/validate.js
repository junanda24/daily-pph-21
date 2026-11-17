import { STATUS_PTKP } from '../data/ptkp.js';

export function assertRupiah(nilai, nama) {
  if (typeof nilai !== 'number' || Number.isNaN(nilai)) {
    throw new TypeError(
      `${nama} harus berupa angka, diterima: ${String(nilai)}`,
    );
  }
  if (!Number.isFinite(nilai)) {
    throw new RangeError(
      `${nama} harus berupa angka berhingga, diterima: ${nilai}`,
    );
  }
  if (nilai < 0) {
    throw new RangeError(`${nama} tidak boleh negatif, diterima: ${nilai}`);
  }
}

export function assertStatusPtkp(status) {
  if (typeof status !== 'string' || !STATUS_PTKP.includes(status)) {
    throw new RangeError(
      `Status PTKP tidak dikenal: ${String(status)}. ` +
        `Status yang valid: ${STATUS_PTKP.join(', ')}`,
    );
  }
  return status;
}

// Bulatkan ke rupiah penuh (setengah ke atas).
export function bulatRupiah(nilai) {
  return Math.round(nilai);
}
