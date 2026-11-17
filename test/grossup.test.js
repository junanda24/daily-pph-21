import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hitungGrossUp } from '../src/lib/grossup.js';
import { hitungPPh21Bulanan } from '../src/lib/ter.js';

describe('R8 — gross-up', () => {
  it('bruto 10jt K/0 → tunjangan 230.179 (naik lapisan ke 2,25%)', () => {
    const hasil = hitungGrossUp({ bruto: 10000000, ptkp: 'K/0' });
    assert.equal(hasil.tunjanganPajak, 230179);
    assert.equal(hasil.brutoKotor, 10230179);
    assert.equal(hasil.pph21, 230179);
    // Gaji bersih kembali sama dengan bruto awal.
    assert.equal(hasil.gajiBersih, 10000000);
    assert.ok(hasil.iterasi <= 10, `iterasi ${hasil.iterasi} terlalu banyak`);
  });

  it('hasil konsisten: PPh21(bruto kotor) = tunjangan pajak', () => {
    for (const [bruto, ptkp] of [
      [7000000, 'TK/0'],
      [15000000, 'TK/1'],
      [25000000, 'K/2'],
      [50000000, 'K/3'],
      [100000000, 'TK/0'],
    ]) {
      const hasil = hitungGrossUp({ bruto, ptkp });
      const cek = hitungPPh21Bulanan({ bruto: hasil.brutoKotor, ptkp }).pph21;
      assert.equal(cek, hasil.tunjanganPajak);
      assert.equal(hasil.brutoKotor - hasil.tunjanganPajak, bruto);
    }
  });

  it('bruto 0 → tunjangan 0', () => {
    const hasil = hitungGrossUp({ bruto: 0, ptkp: 'TK/0' });
    assert.equal(hasil.tunjanganPajak, 0);
    assert.equal(hasil.pph21, 0);
  });
});
