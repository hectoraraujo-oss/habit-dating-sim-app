// Tests del conteo animado (dirección-visual.md §3). El hook React usa rAF, pero la
// matemática del paso vive en `countUpValue` (pura, sin DOM): eso es lo que aquí se prueba.
// En prefers-reduced-motion o duración 0 el hook setea el valor final directo; el equivalente
// puro es que progress >= 1 devuelve `to` EXACTO.

import { describe, expect, it } from 'vitest';
import { countUpValue } from './useCountUp';

describe('countUpValue', () => {
  it('en progress 0 devuelve el valor inicial', () => {
    expect(countUpValue(10, 30, 0)).toBe(10);
  });

  it('en progress 1 (o el final, equivalente a reduced-motion/duración 0) da el valor final EXACTO', () => {
    expect(countUpValue(10, 30, 1)).toBe(30);
    // Cualquier progress >= 1 cae exacto en `to` (no overshoot por el easing).
    expect(countUpValue(10, 30, 1.5)).toBe(30);
  });

  it('el rango es correcto: el valor se mantiene dentro de [from, to] y es monótono', () => {
    const from = 0;
    const to = 40;
    let prev = countUpValue(from, to, 0);
    for (let p = 0; p <= 1.0001; p += 0.1) {
      const v = countUpValue(from, to, p);
      expect(v).toBeGreaterThanOrEqual(from);
      expect(v).toBeLessThanOrEqual(to);
      expect(v).toBeGreaterThanOrEqual(prev); // no retrocede
      prev = v;
    }
  });

  it('clampa progress negativo al inicio (no sale del rango)', () => {
    expect(countUpValue(5, 25, -1)).toBe(5);
  });

  it('cuenta hacia abajo si to < from (count-DOWN), respetando el rango', () => {
    expect(countUpValue(30, 10, 0)).toBe(30);
    expect(countUpValue(30, 10, 1)).toBe(10);
    const mid = countUpValue(30, 10, 0.5);
    expect(mid).toBeLessThanOrEqual(30);
    expect(mid).toBeGreaterThanOrEqual(10);
  });

  it('devuelve enteros (corazones no son fraccionarios)', () => {
    for (let p = 0; p <= 1; p += 0.17) {
      expect(Number.isInteger(countUpValue(0, 13, p))).toBe(true);
    }
  });
});
