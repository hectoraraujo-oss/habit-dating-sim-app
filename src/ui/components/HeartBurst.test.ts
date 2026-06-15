// Tests ligeros del helper puro del burst radial de la celebración mayor (HeartBurst).
// La animación es visual; aquí solo verificamos la repartición de partículas.

import { describe, it, expect } from 'vitest';
import { makeBurst, BURST_COUNT_NORMAL, BURST_COUNT_WEDDING } from './heartBurst.helpers';

describe('makeBurst', () => {
  it('crea la cantidad pedida de partículas con stagger creciente', () => {
    const particles = makeBurst(BURST_COUNT_NORMAL, false);
    expect(particles).toHaveLength(BURST_COUNT_NORMAL);
    // El stagger es i * 40ms: estrictamente creciente.
    const delays = particles.map((p) => parseInt(p.delay, 10));
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
  });

  it('la boda amplifica ~50% las partículas y mezcla 💍/💕', () => {
    const wedding = makeBurst(BURST_COUNT_WEDDING, true);
    expect(wedding).toHaveLength(BURST_COUNT_WEDDING);
    expect(BURST_COUNT_WEDDING).toBeGreaterThan(BURST_COUNT_NORMAL);
    const emojis = new Set(wedding.map((p) => p.emoji));
    expect(emojis.has('💍')).toBe(true);
    expect(emojis.has('💕')).toBe(true);
  });

  it('en nivel normal todas las partículas son 💕 (sin anillos)', () => {
    const normal = makeBurst(BURST_COUNT_NORMAL, false);
    expect(normal.every((p) => p.emoji === '💕')).toBe(true);
  });

  it('reparte los ángulos a lo largo del círculo (no todos iguales)', () => {
    const particles = makeBurst(BURST_COUNT_NORMAL, false);
    const angles = new Set(particles.map((p) => p.angle));
    // Con 14 partículas repartidas + jitter esperamos variedad real de ángulos.
    expect(angles.size).toBeGreaterThan(1);
  });

  it('cada partícula recorre una distancia dentro del rango esperado (110-170px)', () => {
    const particles = makeBurst(BURST_COUNT_WEDDING, true);
    for (const p of particles) {
      const d = parseInt(p.distance, 10);
      expect(d).toBeGreaterThanOrEqual(110);
      expect(d).toBeLessThanOrEqual(170);
    }
  });
});
