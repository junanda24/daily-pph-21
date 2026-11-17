// Contoh: hitung PPh 21 massal untuk banyak karyawan (payroll sederhana).
import { formatRupiah, hitungPPh21Bulanan } from 'pph-21';

const karyawan = [
  { nama: 'Andi', ptkp: 'TK/0', bruto: 6500000 },
  { nama: 'Sari', ptkp: 'K/0', bruto: 10000000 },
  { nama: 'Dewi', ptkp: 'K/2', bruto: 18500000, punyaNpwp: false },
  { nama: 'Rudi', ptkp: 'TK/1', bruto: 4200000 },
];

let totalPajak = 0;
for (const orang of karyawan) {
  const hasil = hitungPPh21Bulanan({
    bruto: orang.bruto,
    ptkp: orang.ptkp,
    punyaNpwp: orang.punyaNpwp !== false,
  });
  totalPajak += hasil.pph21;
  const catatan = hasil.tanpaNpwp ? ' (tanpa NPWP, +20%)' : '';
  console.log(
    `${orang.nama.padEnd(6)} | ${orang.ptkp} | TER ${hasil.kategori} ${hasil.tarifTerPersen}% | PPh 21 ${formatRupiah(hasil.pph21)}${catatan}`,
  );
}
console.log(`\nTotal PPh 21 bulan ini: ${formatRupiah(totalPajak)}`);
