#!/usr/bin/env node
// CLI pph-21 — hitung cepat PPh Pasal 21 dari terminal.
//   pph21 bulanan --bruto 10000000 --ptkp K/0 [--tanpa-npwp]
//   pph21 tahunan --bruto 120000000 --ptkp TK/0 [--iuran 2400000]
//   pph21 harian --bruto 1000000
//   pph21 grossup --bruto 10000000 --ptkp K/0
//   pph21 bukan-pegawai --bruto 10000000
import {
  formatRupiah,
  hitungBukanPegawai,
  hitungGrossUp,
  hitungPPh21Bulanan,
  hitungPPh21Harian,
  hitungPPh21Tahunan,
} from '../src/index.js';

function pakai() {
  return [
    'Pakai: pph21 <perintah> --bruto <angka> [--ptkp <status>] [opsi]',
    '',
    'Perintah:',
    '  bulanan       PPh 21 bulanan (TER) — butuh --ptkp',
    '  tahunan       PPh 21 setahun (progresif) — butuh --ptkp, opsional --iuran',
    '  harian        PPh 21 harian pegawai tidak tetap',
    '  grossup       Tunjangan pajak (pajak ditanggung perusahaan) — butuh --ptkp',
    '  bukan-pegawai PPh 21 bukan pegawai, sekali bayar',
    '',
    'Opsi:',
    '  --bruto <n>   Penghasilan bruto (Rp, angka saja)',
    '  --ptkp <s>    Status PTKP: TK/0 TK/1 TK/2 TK/3 K/0 K/1 K/2 K/3',
    '  --iuran <n>   Iuran pensiun setahun (hanya tahunan)',
    '  --tanpa-npwp  Hitung dengan surcharge 20% (tanpa NPWP)',
    '  --json        Cetak JSON mentah',
    '',
    'Contoh: pph21 bulanan --bruto 10000000 --ptkp K/0',
  ].join('\n');
}

function parseArgv(argv) {
  const perintah = argv[0];
  const opsi = {};
  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      throw new Error(`Argumen tidak dikenal: ${arg}`);
    }
    const kunci = arg.slice(2);
    if (kunci === 'tanpa-npwp' || kunci === 'json') {
      opsi[kunci] = true;
    } else {
      const nilai = argv[i + 1];
      if (nilai === undefined || nilai.startsWith('--')) {
        throw new Error(`Opsi --${kunci} butuh nilai.`);
      }
      opsi[kunci] = nilai;
      i += 1;
    }
  }
  return { perintah, opsi };
}

function bacaRupiah(nilai, nama) {
  const angka = Number(nilai);
  if (nilai === undefined || Number.isNaN(angka) || angka < 0) {
    throw new Error(`--${nama} harus berupa angka >= 0, diterima: ${nilai}`);
  }
  return angka;
}

function cetak(hasil, sebagaiJson) {
  if (sebagaiJson) {
    console.log(JSON.stringify(hasil, null, 2));
    return;
  }
  for (const [kunci, nilai] of Object.entries(hasil)) {
    if (kunci === 'lapisan') {
      console.log('lapisan progresif:');
      for (const lapis of nilai) {
        console.log(
          `  ${lapis.tarifPersen}% × ${formatRupiah(lapis.dasar)} = ${formatRupiah(lapis.pajak)}`,
        );
      }
    } else if (
      typeof nilai === 'number' &&
      /bruto|pajak|pph21|pajak|neto|pkp|ptkp|iuran|tunjangan|gaji|dasar/i.test(
        kunci,
      )
    ) {
      console.log(`${kunci}: ${formatRupiah(nilai)}`);
    } else {
      console.log(`${kunci}: ${nilai}`);
    }
  }
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    console.log(pakai());
    return;
  }
  const { perintah, opsi } = parseArgv(argv);
  const punyaNpwp = !opsi['tanpa-npwp'];
  let hasil;
  switch (perintah) {
    case 'bulanan': {
      if (!opsi.ptkp) throw new Error('Perintah bulanan butuh --ptkp.');
      hasil = hitungPPh21Bulanan({
        bruto: bacaRupiah(opsi.bruto, 'bruto'),
        ptkp: opsi.ptkp,
        punyaNpwp,
      });
      break;
    }
    case 'tahunan': {
      if (!opsi.ptkp) throw new Error('Perintah tahunan butuh --ptkp.');
      hasil = hitungPPh21Tahunan({
        brutoSetahun: bacaRupiah(opsi.bruto, 'bruto'),
        iuranPensiun: opsi.iuran ? bacaRupiah(opsi.iuran, 'iuran') : 0,
        ptkp: opsi.ptkp,
        punyaNpwp,
      });
      break;
    }
    case 'harian': {
      hasil = hitungPPh21Harian({
        brutoHarian: bacaRupiah(opsi.bruto, 'bruto'),
        punyaNpwp,
      });
      break;
    }
    case 'grossup': {
      if (!opsi.ptkp) throw new Error('Perintah grossup butuh --ptkp.');
      hasil = hitungGrossUp({
        bruto: bacaRupiah(opsi.bruto, 'bruto'),
        ptkp: opsi.ptkp,
        punyaNpwp,
      });
      break;
    }
    case 'bukan-pegawai': {
      hasil = hitungBukanPegawai({
        bruto: bacaRupiah(opsi.bruto, 'bruto'),
        punyaNpwp,
      });
      break;
    }
    default:
      throw new Error(`Perintah tidak dikenal: ${perintah}`);
  }
  cetak(hasil, opsi.json);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error('');
  console.error(pakai());
  process.exit(1);
}
