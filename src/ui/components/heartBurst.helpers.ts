// Helper puro del burst radial de la celebración mayor (HeartBurst), separado del componente
// para no romper la regla react-refresh/only-export-components y para poder testearlo sin DOM.

// Cuántos corazones en un nivel normal y en la boda (amplificada ~50% más).
export const BURST_COUNT_NORMAL = 14;
export const BURST_COUNT_WEDDING = 21; // 14 * 1.5

export interface BurstParticle {
  id: number;
  angle: string; // grados de salida desde el centro
  distance: string; // px que recorre
  delay: string; // stagger
  emoji: string; // 💕 normal; mezcla 💍/💕 en boda
}

// Reparte `count` partículas en un círculo completo con un jitter por partícula, una
// distancia variada y (en boda) alterna 💍/💕. Pura salvo el jitter aleatorio, que el
// componente congela una sola vez al montar (initializer perezoso).
export function makeBurst(count: number, wedding: boolean): BurstParticle[] {
  return Array.from({ length: count }, (_, i) => {
    // Distribución pareja alrededor del círculo + jitter para que no quede mecánico.
    const baseAngle = (360 / count) * i;
    const jitter = (Math.random() * 2 - 1) * (180 / count);
    return {
      id: i,
      angle: `${Math.round(baseAngle + jitter)}deg`,
      distance: `${Math.round(110 + Math.random() * 60)}px`, // 110-170px
      delay: `${i * 40}ms`, // stagger ~40ms
      // En boda alternamos anillo/corazón; en nivel normal solo corazón.
      emoji: wedding && i % 2 === 0 ? '💍' : '💕',
    };
  });
}
