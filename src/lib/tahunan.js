import {
  BIAYA_JABATAN_MAKS_SETAHUN,
  BIAYA_JABATAN_PERSEN,
  FAKTOR_TANPA_NPWP,
  TARIF_PROGRESIF,
} from '../data/progresif.js';
import { assertRupiah, assertStatusPtkp, bulatRupiah } from './validate.js';
import { getPtkp } from './ter.js';

// Hitung pajak progresif Pasal 17 atas PKP.
// Mengembalikan { lapisan: [{ batasAtas, tarif, dasar, pajak }], total }.
export function hitungProgresif(pkp) {
  const lapisan = [];
  let sisa = pkp;
  let batasBawah = 0;
  let total = 0;
  for (const [batasAtas, persen] of TARIF_PROGRESIF) {
    if (sisa <= 0) break;
    const lebar = batasAtas - batasBawah;
    const dasar = Math.min(sisa, lebar);
    const tarif = persen / 100;
    const pajak = bulatRupiah(dasar * tarif);
    lapisan.push({ batasAtas, tarif, tarifPersen: persen, dasar, pajak });
    total += pajak;
    sisa -= dasar;
    batasBawah = batasAtas;
  }
  return { lapisan, total };
}

// PPh 21 setahun pegawai tetap (dipakai untuk rekonsiliasi Desember dan
// SPT Tahunan). PKP dibulatkan ke bawah ke ribuan penuh (UU PPh Pasal 17).
export function hitungPPh21Tahunan({
  brutoSetahun,
  iuranPensiun = 0,
  ptkp,
  punyaNpwp = true,
}) {
  assertRupiah(brutoSetahun, 'brutoSetahun');
  assertRupiah(iuranPensiun, 'iuranPensiun');
  assertStatusPtkp(ptkp);
  const nilaiPtkp = getPtkp(ptkp);
  const biayaJabatan = Math.min(
    Math.floor((brutoSetahun * BIAYA_JABATAN_PERSEN) / 100),
    BIAYA_JABATAN_MAKS_SETAHUN,
  );
  const penghasilanNeto = Math.max(
    0,
    brutoSetahun - biayaJabatan - iuranPensiun,
  );
  const pkp = Math.max(
    0,
    Math.floor((penghasilanNeto - nilaiPtkp) / 1000) * 1000,
  );
  const { lapisan, total } = hitungProgresif(pkp);
  const pph21Setahun = punyaNpwp
    ? total
    : bulatRupiah(total * FAKTOR_TANPA_NPWP);
  return {
    brutoSetahun,
    biayaJabatan,
    iuranPensiun,
    penghasilanNeto,
    ptkp,
    nilaiPtkp,
    pkp,
    lapisan,
    pph21Setahun,
    pph21PerBulan: Math.floor(pph21Setahun / 12),
    tanpaNpwp: !punyaNpwp,
  };
}

// Rekonsiliasi masa pajak terakhir (Desember) — PMK 168/2023 Pasal 15:
// PPh 21 Desember = PPh 21 setahun − yang sudah dipotong Jan–Nov.
export function hitungDesember({ pph21Setahun, sudahDipotong }) {
  assertRupiah(pph21Setahun, 'pph21Setahun');
  assertRupiah(sudahDipotong, 'sudahDipotong');
  const selisih = pph21Setahun - sudahDipotong;
  return {
    pph21Setahun,
    sudahDipotong,
    pph21Desember: Math.max(0, selisih),
    lebihPotong: Math.max(0, -selisih),
  };
}
