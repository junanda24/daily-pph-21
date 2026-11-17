import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRupiah,
  assertStatusPtkp,
  bulatRupiah,
} from '../src/lib/validate.js';

describe('R10 — validasi input', () => {
  it('assertRupiah menerima 0 dan angka positif', () => {
    assert.doesNotThrow(() => assertRupiah(0, 'x'));
    assert.doesNotThrow(() => assertRupiah(1000000, 'x'));
  });

  it('assertRupiah menolak NaN, Infinity, negatif, dan bukan angka', () => {
    assert.throws(() => assertRupiah(Number.NaN, 'gaji'), TypeError);
    assert.throws(() => assertRupiah(Infinity, 'gaji'), RangeError);
    assert.throws(() => assertRupiah(-1, 'gaji'), RangeError);
    assert.throws(() => assertRupiah('1000', 'gaji'), TypeError);
    assert.throws(() => assertRupiah(undefined, 'gaji'), TypeError);
  });

  it('pesan error menyebutkan nama parameter', () => {
    assert.throws(() => assertRupiah(-5, 'bruto'), /bruto/);
  });

  it('assertStatusPtkp menerima semua status valid', () => {
    for (const status of ['TK/0', 'TK/3', 'K/2', 'K/3', 'K/I/1']) {
      assert.equal(assertStatusPtkp(status), status);
    }
  });

  it('assertStatusPtkp menolak status asing dengan daftar valid', () => {
    assert.throws(() => assertStatusPtkp('TK/4'), /TK\/0/);
  });

  it('bulatRupiah: setengah ke atas', () => {
    assert.equal(bulatRupiah(100.5), 101);
    assert.equal(bulatRupiah(100.4), 100);
  });
});
