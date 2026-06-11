// Tests de las funciones puras de corazones y niveles (mecanicas-detalle §2, §4, §9).

import { describe, expect, it } from 'vitest';
import { calcHeartsEarned, heartsToNextLevel, lateMultiplier, levelForHearts } from './hearts';

describe('lateMultiplier', () => {
  it('aplica el gradiente por retraso de mecanicas-detalle §4', () => {
    expect(lateMultiplier(0)).toBe(1);
    expect(lateMultiplier(1)).toBe(0.75);
    expect(lateMultiplier(3)).toBe(0.75);
    expect(lateMultiplier(4)).toBe(0.5);
    expect(lateMultiplier(7)).toBe(0.5);
    expect(lateMultiplier(8)).toBe(0.25);
    expect(lateMultiplier(30)).toBe(0.25);
  });
});

describe('calcHeartsEarned', () => {
  it('a tiempo otorga la recompensa completa por dificultad', () => {
    expect(calcHeartsEarned('easy', '2026-06-15', '2026-06-15')).toBe(5);
    expect(calcHeartsEarned('medium', '2026-06-15', '2026-06-10')).toBe(10);
    expect(calcHeartsEarned('hard', '2026-06-15', '2026-06-15')).toBe(18);
  });

  it('redondea hacia arriba al aplicar el multiplicador (5 × 0.75 = 3.75 → 4)', () => {
    expect(calcHeartsEarned('easy', '2026-06-15', '2026-06-16')).toBe(4);
    expect(calcHeartsEarned('hard', '2026-06-15', '2026-06-20')).toBe(9);
    expect(calcHeartsEarned('easy', '2026-06-15', '2026-06-30')).toBe(2);
  });
});

describe('levelForHearts', () => {
  it('respeta los umbrales 20/60/140', () => {
    expect(levelForHearts(0)).toBe(0);
    expect(levelForHearts(19)).toBe(0);
    expect(levelForHearts(20)).toBe(1);
    expect(levelForHearts(59)).toBe(1);
    expect(levelForHearts(60)).toBe(2);
    expect(levelForHearts(139)).toBe(2);
    expect(levelForHearts(140)).toBe(3);
    expect(levelForHearts(500)).toBe(3);
  });
});

describe('heartsToNextLevel', () => {
  it('muestra el progreso dentro del nivel actual (ejemplos de mecanicas-detalle §2)', () => {
    expect(heartsToNextLevel(1, 25)).toEqual({ current: 5, total: 40, display: '5/40' });
    expect(heartsToNextLevel(2, 75)).toEqual({ current: 15, total: 80, display: '15/80' });
    expect(heartsToNextLevel(0, 0)).toEqual({ current: 0, total: 20, display: '0/20' });
  });

  it('devuelve null en nivel máximo', () => {
    expect(heartsToNextLevel(3, 150)).toBeNull();
  });
});
