// Contoh: slip gaji karyawan tetap — bulanan (TER), tahunan, dan Desember.
import {
  formatRupiah,
  hitungDesember,
  hitungPPh21Bulanan,
  hitungPPh21Tahunan,
} from 'pph-21';

const karyawan = {
  nama: 'Budi Santoso',
  ptkp: 'K/1',
  brutoBulanan: 12500000, // gaji pokok + tunjangan
  iuranPensiunBulanan: 250000,
};

// 1. Potongan tiap bulan (Jan–Nov) pakai TER.
const bulanan = hitungPPh21Bulanan({
  bruto: karyawan.brutoBulanan,
  ptkp: karyawan.ptkp,
});
console.log(`${karyawan.nama} (${karyawan.ptkp})`);
console.log(`Bruto/bulan      : ${formatRupiah(karyawan.brutoBulanan)}`);
console.log(
  `Kategori TER      : ${bulanan.kategori} (${bulanan.tarifTerPersen}%)`,
);
console.log(`PPh 21/bulan     : ${formatRupiah(bulanan.pph21)}`);

// 2. Hitungan setahun penuh (progresif) untuk rekonsiliasi.
const tahunan = hitungPPh21Tahunan({
  brutoSetahun: karyawan.brutoBulanan * 12,
  iuranPensiun: karyawan.iuranPensiunBulanan * 12,
  ptkp: karyawan.ptkp,
});
console.log(
  `\nPPh 21 setahun    : ${formatRupiah(tahunan.pph21Setahun)} (PKP ${formatRupiah(tahunan.pkp)})`,
);

// 3. Desember = setahun − yang sudah dipotong 11 bulan.
const desember = hitungDesember({
  pph21Setahun: tahunan.pph21Setahun,
  sudahDipotong: bulanan.pph21 * 11,
});
console.log(`PPh 21 Desember   : ${formatRupiah(desember.pph21Desember)}`);
