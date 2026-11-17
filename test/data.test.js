import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TER_A, TER_B, TER_C } from '../src/data/ter.js';
import { PTKP, STATUS_PTKP } from '../src/data/ptkp.js';
import { TARIF_PROGRESIF } from '../src/data/progresif.js';

function periksaTabel(tabel, jumlah, nama) {
  it(`${nama}: ${jumlah} lapisan, batas naik, tarif naik, diakhiri Infinity`, () => {
    assert.equal(tabel.length, jumlah);
    let batasSebelumnya = 0;
    let tarifSebelumnya = -1;
    for (const [batas, tarif] of tabel) {
      assert.ok(
        batas > batasSebelumnya,
        `${nama}: batas tidak naik di ${batas}`,
      );
      assert.ok(
        tarif >= tarifSebelumnya,
        `${nama}: tarif tidak naik di ${tarif}`,
      );
      batasSebelumnya = batas;
      tarifSebelumnya = tarif;
    }
    assert.equal(tabel.at(-1)[0], Infinity);
    assert.equal(tabel.at(-1)[1], 34);
    assert.equal(tabel[0][1], 0);
  });
}

describe('R11 — integritas data tabel', () => {
  periksaTabel(TER_A, 44, 'TER_A');
  periksaTabel(TER_B, 40, 'TER_B');
  periksaTabel(TER_C, 41, 'TER_C');

  it('PTKP: 12 status', () => {
    assert.equal(STATUS_PTKP.length, 12);
    assert.equal(Object.keys(PTKP).length, 12);
  });

  it('tarif progresif: 5 lapisan UU HPP', () => {
    assert.equal(TARIF_PROGRESIF.length, 5);
    assert.deepEqual(
      TARIF_PROGRESIF.map(([, persen]) => persen),
      [5, 15, 25, 30, 35],
    );
  });
});
