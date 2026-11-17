import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getKategoriTer,
  getTarifTer,
  hitungPPh21Bulanan,
  hitungPPh21Harian,
} from '../src/lib/ter.js';

describe('R2 — kategori TER dari status PTKP', () => {
  it('A: TK/0, TK/1, K/0', () => {
    assert.equal(getKategoriTer('TK/0'), 'A');
    assert.equal(getKategoriTer('TK/1'), 'A');
    assert.equal(getKategoriTer('K/0'), 'A');
  });

  it('B: TK/2, TK/3, K/1, K/2', () => {
    assert.equal(getKategoriTer('TK/2'), 'B');
    assert.equal(getKategoriTer('TK/3'), 'B');
    assert.equal(getKategoriTer('K/1'), 'B');
    assert.equal(getKategoriTer('K/2'), 'B');
  });

  it('C: K/3', () => {
    assert.equal(getKategoriTer('K/3'), 'C');
  });

  it('K/I ditolak dengan penjelasan (tidak punya kategori TER)', () => {
    assert.throws(() => getKategoriTer('K/I/0'), /tidak punya kategori TER/);
    assert.throws(() => getKategoriTer('K/I/3'), /tidak punya kategori TER/);
  });
});

describe('R3 — tarif TER bulanan', () => {
  it('batas bawah 0% kategori A', () => {
    assert.equal(getTarifTer(5400000, 'TK/0').tarif, 0);
    assert.equal(getTarifTer(0, 'TK/0').tarif, 0);
  });

  it('satu rupiah di atas batas langsung naik lapisan', () => {
    assert.equal(getTarifTer(5400001, 'TK/0').tarif, 0.0025);
    assert.equal(getTarifTer(5650000, 'TK/0').tarif, 0.0025);
    assert.equal(getTarifTer(5650001, 'TK/0').tarif, 0.005);
  });

  it('contoh resmi: bruto 10jt K/0 → 2%', () => {
    const hasil = getTarifTer(10000000, 'K/0');
    assert.equal(hasil.kategori, 'A');
    assert.equal(hasil.tarif, 0.02);
    assert.equal(hasil.tarifPersen, 2);
  });

  it('bruto 8jt TK/0 → 1,5%', () => {
    assert.equal(getTarifTer(8000000, 'TK/0').tarif, 0.015);
  });

  it('ambang 0% berbeda per kategori', () => {
    assert.equal(getTarifTer(6200000, 'TK/2').tarif, 0);
    assert.equal(getTarifTer(6200001, 'TK/2').tarif, 0.0025);
    assert.equal(getTarifTer(6600000, 'K/3').tarif, 0);
    assert.equal(getTarifTer(6600001, 'K/3').tarif, 0.0025);
  });

  it('lapisan tertinggi 34% tanpa batas atas', () => {
    assert.equal(getTarifTer(1400000000, 'TK/0').tarif, 0.33);
    assert.equal(getTarifTer(1400000001, 'TK/0').tarif, 0.34);
    assert.equal(getTarifTer(5000000000, 'K/3').tarif, 0.34);
  });

  it('input tidak valid ditolak', () => {
    assert.throws(() => getTarifTer(-1, 'TK/0'), RangeError);
    assert.throws(() => getTarifTer('x', 'TK/0'), TypeError);
    assert.throws(() => getTarifTer(1000000, 'K/I/0'), RangeError);
  });
});

describe('R4 — PPh 21 bulanan', () => {
  it('contoh Lab Nalar: bruto 10jt K/0 → Rp200.000', () => {
    const hasil = hitungPPh21Bulanan({ bruto: 10000000, ptkp: 'K/0' });
    assert.equal(hasil.pph21, 200000);
    assert.equal(hasil.kategori, 'A');
    assert.equal(hasil.tarifTer, 0.02);
    assert.equal(hasil.tanpaNpwp, false);
  });

  it('bruto di bawah ambang → 0', () => {
    assert.equal(hitungPPh21Bulanan({ bruto: 5000000, ptkp: 'TK/0' }).pph21, 0);
  });

  it('tanpa NPWP → 20% lebih tinggi', () => {
    const hasil = hitungPPh21Bulanan({
      bruto: 10000000,
      ptkp: 'K/0',
      punyaNpwp: false,
    });
    assert.equal(hasil.pph21, 240000);
    assert.equal(hasil.tanpaNpwp, true);
  });
});

describe('R5 — PPh 21 harian', () => {
  it('≤ Rp450.000 → 0%', () => {
    assert.equal(hitungPPh21Harian({ brutoHarian: 400000 }).pph21, 0);
    assert.equal(hitungPPh21Harian({ brutoHarian: 450000 }).pph21, 0);
  });

  it('Rp1.000.000 → 0,5% = Rp5.000', () => {
    const hasil = hitungPPh21Harian({ brutoHarian: 1000000 });
    assert.equal(hasil.tarifTer, 0.005);
    assert.equal(hasil.pph21, 5000);
  });

  it('batas atas harian Rp2.500.000 → Rp12.500', () => {
    assert.equal(hitungPPh21Harian({ brutoHarian: 2500000 }).pph21, 12500);
  });

  it('di atas Rp2.500.000/hari ditolak', () => {
    assert.throws(
      () => hitungPPh21Harian({ brutoHarian: 2500001 }),
      RangeError,
    );
  });

  it('tanpa NPWP → 20% lebih tinggi', () => {
    assert.equal(
      hitungPPh21Harian({ brutoHarian: 1000000, punyaNpwp: false }).pph21,
      6000,
    );
  });
});
