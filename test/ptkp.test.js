import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPtkp } from '../src/lib/ter.js';

describe('R1 — PTKP (PMK 101/2016)', () => {
  it('nilai dasar dan tambahan tanggungan', () => {
    assert.equal(getPtkp('TK/0'), 54000000);
    assert.equal(getPtkp('TK/1'), 58500000);
    assert.equal(getPtkp('TK/2'), 63000000);
    assert.equal(getPtkp('TK/3'), 67500000);
    assert.equal(getPtkp('K/0'), 58500000);
    assert.equal(getPtkp('K/1'), 63000000);
    assert.equal(getPtkp('K/2'), 67500000);
    assert.equal(getPtkp('K/3'), 72000000);
  });

  it('status K/I (penghasilan istri digabung)', () => {
    assert.equal(getPtkp('K/I/0'), 112500000);
    assert.equal(getPtkp('K/I/1'), 117000000);
    assert.equal(getPtkp('K/I/2'), 121500000);
    assert.equal(getPtkp('K/I/3'), 126000000);
  });

  it('status tidak dikenal melempar RangeError', () => {
    assert.throws(() => getPtkp('TK/9'), RangeError);
    assert.throws(() => getPtkp('K/4'), RangeError);
    assert.throws(() => getPtkp(''), RangeError);
    assert.throws(() => getPtkp(0), RangeError);
  });
});
