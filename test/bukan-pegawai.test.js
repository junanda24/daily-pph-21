import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hitungBukanPegawai } from '../src/lib/bukanPegawai.js';
import { formatRupiah } from '../src/lib/format.js';

describe('R9 — bukan pegawai (sekali bayar)', () => {
  it('bruto 10jt → DPP 5jt → 5% = Rp250.000', () => {
    const hasil = hitungBukanPegawai({ bruto: 10000000 });
    assert.equal(hasil.dasarPengenaan, 5000000);
    assert.equal(hasil.pph21, 250000);
    assert.equal(hasil.lapisan.length, 1);
    assert.equal(hasil.lapisan[0].tarif, 0.05);
  });

  it('DPP besar melewati beberapa lapisan progresif', () => {
    // Bruto 300jt → DPP 150jt → 5%×60jt + 15%×90jt = 3jt + 13,5jt.
    const hasil = hitungBukanPegawai({ bruto: 300000000 });
    assert.equal(hasil.dasarPengenaan, 150000000);
    assert.equal(hasil.pph21, 16500000);
    assert.equal(hasil.lapisan.length, 2);
  });

  it('tanpa NPWP → 20% lebih tinggi', () => {
    assert.equal(
      hitungBukanPegawai({ bruto: 10000000, punyaNpwp: false }).pph21,
      300000,
    );
  });

  it('bruto negatif ditolak', () => {
    assert.throws(() => hitungBukanPegawai({ bruto: -1000 }), RangeError);
  });
});

describe('formatRupiah', () => {
  it('format Indonesia', () => {
    assert.equal(formatRupiah(10000000), 'Rp10.000.000');
    assert.equal(formatRupiah(0), 'Rp0');
    assert.equal(formatRupiah(500), 'Rp500');
  });

  it('bukan angka ditolak', () => {
    assert.throws(() => formatRupiah('x'), TypeError);
  });
});
