// Confeti de hito (Fase 4 Ola 6, dirección-feel-duolingo.md §5).
//
// Envuelve canvas-confetti para la celebración de HITOS (no de cada misión: gastarlo en cada
// complete lo devalúa). Dos magnitudes:
//   - confettiLevelUp(): subir de nivel (NO boda). UNA descarga media (~80 partículas).
//   - confettiWedding(): boda (clímax). DOS descargas escalonadas (0ms y 250ms) desde ambos
//     lados, ~120 partículas c/u, con amber (--color-milestone) en la mezcla.
//
// Reglas duras del §5:
//   - `disableForReducedMotion: true` en CADA llamada (canvas-confetti lo respeta nativo: si el
//     usuario pidió reducir movimiento, no dispara nada).
//   - El confeti entra DESPUÉS del pop del sprite (T≈200ms): el orquestador lo programa con un
//     timer; las funciones de descarga son síncronas, el delay lo maneja quien llama (ver
//     useMilestoneConfetti más abajo, que devuelve el cleanup del/los timer/s).
//
// 80/20 INVIOLABLE: la pérdida NUNCA llama a esto. Cero partículas festivas en cancelación/
// abandono. Este módulo solo se importa desde celebraciones.

import confetti from 'canvas-confetti';

// Hexes EXACTOS de los tokens (--color-love, --color-primary, --color-milestone) + blanco.
// canvas-confetti necesita colores literales (no lee CSS custom properties).
const LOVE = '#e11d80';
const PRIMARY = '#ec4899';
const MILESTONE = '#f59e0b';
const WHITE = '#ffffff';

// Subir de nivel (NO boda): confeti MEDIO. Una sola descarga, ~80 partículas, desde el
// centro-arriba, abanico amplio. Colores love + primary + blanco.
export function confettiLevelUp(): void {
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.35 },
    colors: [LOVE, PRIMARY, WHITE],
    disableForReducedMotion: true,
  });
}

// Boda (clímax): confeti MÁXIMO. Una descarga desde cada lado (x:0.2 y x:0.8), ~120
// partículas c/u, mezcla amber (milestone) + love + blanco. Las DOS descargas se escalonan
// (0ms y 250ms) por el orquestador (useMilestoneConfetti); esta función dispara UN par
// (izquierda + derecha) en el mismo frame que se le llama.
function confettiWeddingBurst(): void {
  const colors = [MILESTONE, LOVE, WHITE];
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 50,
    angle: 60, // hacia la derecha-arriba desde la izquierda
    origin: { x: 0.2, y: 0.5 },
    colors,
    disableForReducedMotion: true,
  });
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 50,
    angle: 120, // hacia la izquierda-arriba desde la derecha
    origin: { x: 0.8, y: 0.5 },
    colors,
    disableForReducedMotion: true,
  });
}

// Tiempo tras montar antes del confeti: DESPUÉS del pop del sprite (§5, T≈200ms), no en el
// mismo frame, para que el ojo siga una secuencia.
export const CONFETTI_DELAY_MS = 200;
// Escalón de la segunda descarga de boda (§5).
export const WEDDING_SECOND_BURST_MS = 250;

// Programa el confeti de un hito tras CONFETTI_DELAY_MS. Devuelve una función de limpieza que
// cancela cualquier timer pendiente (para llamar desde el cleanup de un useEffect). Bajo
// reduced-motion canvas-confetti no dispara, pero igual programamos el timer (la propia
// llamada decide no pintar); mantener un solo camino simplifica el cleanup.
export function scheduleMilestoneConfetti(wedding: boolean): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  if (wedding) {
    // Boda: dos descargas escalonadas (0ms y 250ms) DESPUÉS del delay del pop.
    timers.push(setTimeout(confettiWeddingBurst, CONFETTI_DELAY_MS));
    timers.push(
      setTimeout(confettiWeddingBurst, CONFETTI_DELAY_MS + WEDDING_SECOND_BURST_MS),
    );
  } else {
    // Subir de nivel: una sola descarga media.
    timers.push(setTimeout(confettiLevelUp, CONFETTI_DELAY_MS));
  }
  return () => timers.forEach(clearTimeout);
}
