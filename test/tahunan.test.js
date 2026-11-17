import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hitungDesember,
  hitungPPh21Tahunan,
  hitungProgresif,
} from '../src/lib/tahunan.js';

describe('R6 — PPh 21 tahunan progresif', () => {
  it('PKP 100jt → Rp9.000.000 (5% × 60jt + 15% × 40jt)', () => {
    const { total } = hitungProgresif(100000000);
    assert.equal(total, 9000000);
  });

  it('PKP 60jt → Rp3.000.000', () => {
    assert.equal(hitungProgresif(60000000).total, 3000000);
  });

  it('PKP 0 → 0', () => {
    assert.equal(hitungProgresif(0).total, 0);
    assert.deepEqual(hitungProgresif(0).lapisan, []);
  });

  it('PKP 600jt → 5%×60 + 15%×190 + 25%×250 + 30%×100', () => {
    // 3.000.000 + 28.500.000 + 62.500.000 + 30.000.000
    assert.equal(hitungProgresif(600000000).total, 124000000);
  });

  it('contoh ujung-ke-ujung: bruto 120jt/thn, TK/0', () => {
    // Biaya jabatan 5% × 120jt = 6jt (pas di batas maks).
    // Neto 114jt − PTKP 54jt = PKP 60jt → 5% = 3jt.
    const hasil = hitungPPh21Tahunan({ brutoSetahun: 120000000, ptkp: 'TK/0' });
    assert.equal(hasil.biayaJabatan, 6000000);
    assert.equal(hasil.penghasilanNeto, 114000000);
    assert.equal(hasil.pkp, 60000000);
    assert.equal(hasil.pph21Setahun, 3000000);
    assert.equal(hasil.pph21PerBulan, 250000);
  });

  it('biaya jabatan dibatasi Rp6.000.000/setahun', () => {
    const hasil = hitungPPh21Tahunan({ brutoSetahun: 300000000, ptkp: 'TK/0' });
    assert.equal(hasil.biayaJabatan, 6000000);
  });

  it('iuran pensiun mengurangi penghasilan neto', () => {
    const hasil = hitungPPh21Tahunan({
      brutoSetahun: 120000000,
      iuranPensiun: 2400000,
      ptkp: 'TK/0',
    });
    assert.equal(hasil.penghasilanNeto, 111600000);
    assert.equal(hasil.pkp, 57600000);
  });

  it('PKP dibulatkan ke bawah ke ribuan penuh', () => {
    // Bruto 100.123.456 → biaya jabatan 5.006.172 (floor 5%),
    // neto 95.117.284 − PTKP 54jt = 41.117.284 → PKP 41.117.000.
    const hasil = hitungPPh21Tahunan({ brutoSetahun: 100123456, ptkp: 'TK/0' });
    assert.equal(hasil.pkp, 41117000);
    assert.equal(hasil.pkp % 1000, 0);
  });

  it('neto di bawah PTKP → pajak 0', () => {
    const hasil = hitungPPh21Tahunan({ brutoSetahun: 50000000, ptkp: 'TK/0' });
    assert.equal(hasil.pkp, 0);
    assert.equal(hasil.pph21Setahun, 0);
  });

  it('tanpa NPWP → 20% lebih tinggi', () => {
    const hasil = hitungPPh21Tahunan({
      brutoSetahun: 120000000,
      ptkp: 'TK/0',
      punyaNpwp: false,
    });
    assert.equal(hasil.pph21Setahun, 3600000);
  });

  it('input tidak valid ditolak', () => {
    assert.throws(
      () => hitungPPh21Tahunan({ brutoSetahun: -1, ptkp: 'TK/0' }),
      RangeError,
    );
    assert.throws(
      () => hitungPPh21Tahunan({ brutoSetahun: 1000000, ptkp: 'XX' }),
      RangeError,
    );
  });
});

describe('R7 — rekonsiliasi Desember', () => {
  it('pph21 setahun 9jt, sudah dipotong 8,2jt → Desember 800rb', () => {
    const hasil = hitungDesember({
      pph21Setahun: 9000000,
      sudahDipotong: 8200000,
    });
    assert.equal(hasil.pph21Desember, 800000);
    assert.equal(hasil.lebihPotong, 0);
  });

  it('kelebihan potong tidak jadi negatif', () => {
    const hasil = hitungDesember({
      pph21Setahun: 9000000,
      sudahDipotong: 9500000,
    });
    assert.equal(hasil.pph21Desember, 0);
    assert.equal(hasil.lebihPotong, 500000);
  });

  it('sudah dipotong pas → Desember 0', () => {
    const hasil = hitungDesember({
      pph21Setahun: 9000000,
      sudahDipotong: 9000000,
    });
    assert.equal(hasil.pph21Desember, 0);
    assert.equal(hasil.lebihPotong, 0);
  });
});
