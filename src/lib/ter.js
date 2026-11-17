import { TER_A, TER_B, TER_C } from '../data/ter.js';
import { KATEGORI_TER, PTKP } from '../data/ptkp.js';
import {
  BRUTO_HARIAN_MAKS,
  FAKTOR_TANPA_NPWP,
  TER_HARIAN,
} from '../data/progresif.js';
import { assertRupiah, assertStatusPtkp, bulatRupiah } from './validate.js';

const TABEL_TER = Object.freeze({ A: TER_A, B: TER_B, C: TER_C });

export function getPtkp(status) {
  assertStatusPtkp(status);
  return PTKP[status];
}

export function getKategoriTer(status) {
  assertStatusPtkp(status);
  const kategori = KATEGORI_TER[status];
  if (kategori === undefined) {
    throw new RangeError(
      `Status ${status} (penghasilan istri digabung) tidak punya kategori TER. ` +
        'Status K/I hanya dipakai untuk SPT Tahunan gabungan, bukan untuk ' +
        'pemotongan PPh 21 bulanan oleh pemberi kerja. Pakai status K/0–K/3.',
    );
  }
  return kategori;
}

// Cari tarif (desimal, mis. 0.02) dari tabel: baris pertama yang batas
// atasnya >= bruto. Batas atas tiap lapisan inklusif.
function cariTarif(tabel, bruto) {
  const baris = tabel.find(([batasAtas]) => bruto <= batasAtas);
  return baris[1] / 100;
}

export function getTarifTer(brutoBulanan, ptkp) {
  assertRupiah(brutoBulanan, 'brutoBulanan');
  const kategori = getKategoriTer(ptkp);
  const tarif = cariTarif(TABEL_TER[kategori], brutoBulanan);
  return { kategori, tarif, tarifPersen: tarif * 100 };
}

function terapkanNpwp(pph21, punyaNpwp) {
  if (punyaNpwp) return { pph21, tanpaNpwp: false };
  return { pph21: bulatRupiah(pph21 * FAKTOR_TANPA_NPWP), tanpaNpwp: true };
}

// PPh 21 bulanan pegawai tetap, masa pajak selain Desember (Jan–Nov).
// PPh 21 = bruto × tarif TER.
export function hitungPPh21Bulanan({ bruto, ptkp, punyaNpwp = true }) {
  assertRupiah(bruto, 'bruto');
  const { kategori, tarif, tarifPersen } = getTarifTer(bruto, ptkp);
  const dasar = bulatRupiah(bruto * tarif);
  const hasil = terapkanNpwp(dasar, punyaNpwp);
  return {
    bruto,
    ptkp,
    kategori,
    tarifTer: tarif,
    tarifTerPersen: tarifPersen,
    pph21: hasil.pph21,
    tanpaNpwp: hasil.tanpaNpwp,
  };
}

// PPh 21 harian pegawai tidak tetap (PMK 168/2023).
export function hitungPPh21Harian({ brutoHarian, punyaNpwp = true }) {
  assertRupiah(brutoHarian, 'brutoHarian');
  if (brutoHarian > BRUTO_HARIAN_MAKS) {
    throw new RangeError(
      `Bruto harian Rp${brutoHarian.toLocaleString('id-ID')} di atas ` +
        `Rp${BRUTO_HARIAN_MAKS.toLocaleString('id-ID')}. Tabel tarif harian ` +
        'resmi hanya mencakup sampai Rp2.500.000/hari; di atas itu bukan ' +
        'kasus pegawai harian.',
    );
  }
  const tarif = cariTarif(TER_HARIAN, brutoHarian);
  const dasar = bulatRupiah(brutoHarian * tarif);
  const hasil = terapkanNpwp(dasar, punyaNpwp);
  return {
    brutoHarian,
    tarifTer: tarif,
    tarifTerPersen: tarif * 100,
    pph21: hasil.pph21,
    tanpaNpwp: hasil.tanpaNpwp,
  };
}
