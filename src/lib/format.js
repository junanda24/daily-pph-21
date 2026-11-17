// Format angka menjadi "Rp10.000.000".
export function formatRupiah(nilai) {
  if (typeof nilai !== 'number' || Number.isNaN(nilai)) {
    throw new TypeError(
      `formatRupiah menerima angka, diterima: ${String(nilai)}`,
    );
  }
  return `Rp${nilai.toLocaleString('id-ID')}`;
}
