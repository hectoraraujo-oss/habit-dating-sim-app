// Barra de corazones: progreso DENTRO del nivel actual (mecanicas-detalle §2).
// En nivel 3 muestra "Consolidado" en lugar de barra.
//
// Fase 4 Ola 1 (dirección-visual.md §3): si recibe `animateFromHearts` (el heartsTotal de
// ANTES de completar la misión), la barra se llena con transition-[width], el número cuenta
// hacia arriba (useCountUp) y dispara bar-shimmer una vez al terminar. El corazón/relleno
// usa SIEMPRE --color-love (token de cohesión); el vacío --color-love-soft.

import { useEffect, useState } from 'react';
import type { Character } from '../../types';
import { heartsToNextLevel } from '../../game/hearts';
import { useCountUp } from '../hooks/useCountUp';

interface HeartsBarProps {
  character: Character;
  atRisk?: boolean;
  // heartsTotal de ANTES de la última misión: dispara el llenado animado + conteo + shimmer.
  animateFromHearts?: number;
  // 'gain' (default): celebración — el conteo sube y la barra hace shimmer al llenarse.
  // 'loss': penalización sobria (dirección-visual.md §3) — la barra BAJA con la misma
  // transición pero SIN shimmer (nada de fiesta); el conteo desciende. Más lenta a propósito
  // no: la pérdida nunca dura ni brilla más que la ganancia equivalente.
  mode?: 'gain' | 'loss';
}

export function HeartsBar({
  character,
  atRisk = false,
  animateFromHearts,
  mode = 'gain',
}: HeartsBarProps) {
  const progress = heartsToNextLevel(character.level, character.heartsTotal);
  const animating = animateFromHearts !== undefined && progress !== null;

  // Progreso "antes" para el punto de partida del llenado (mismo nivel actual).
  const progressFrom =
    animating && progress ? heartsToNextLevel(character.level, animateFromHearts!) : null;

  const toCurrent = progress ? progress.current : 0;
  const fromCurrent = progressFrom ? progressFrom.current : toCurrent;

  const total = progress ? progress.total : 1;
  const targetRatio = progress ? Math.min(1, Math.max(0, progress.current / total)) : 0;
  const fromRatio = progressFrom ? Math.min(1, Math.max(0, progressFrom.current / total)) : targetRatio;

  // Hooks SIEMPRE se llaman (antes de cualquier return condicional) — Rules of Hooks.
  const animatedCurrent = useCountUp(animating ? fromCurrent : toCurrent, toCurrent, 800);
  // Solo mientras anima usamos estado: nace en el ratio "antes" y, tras montar, transiciona
  // al "después" (esto dispara la transition-[width]). Sin animación, se pinta targetRatio
  // directo (sin estado ni setState en efecto).
  const [moved, setMoved] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    if (!animating) return;
    // En el frame siguiente al montaje, mueve la barra a su valor final (dispara la transición).
    const raf =
      typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => setMoved(true)) : 0;
    // Shimmer SOLO en ganancia (celebración). En 'loss' la pérdida es sobria: nada de brillo.
    if (mode === 'loss') {
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }
    // Shimmer una vez al terminar de llenarse (~800ms de la transición de width).
    const t = setTimeout(() => setShimmer(true), 820);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [animating, mode]);

  // Nivel máximo: sin barra. (Se evalúa DESPUÉS de los hooks.)
  if (!progress) {
    return <p className="text-sm font-semibold text-milestone">✓ Hábito consolidado</p>;
  }

  const ratio = animating ? (moved ? targetRatio : fromRatio) : targetRatio;
  const shownCurrent = animating ? animatedCurrent : progress.current;
  const fillColor = atRisk ? 'bg-risk' : 'bg-love';
  // En 'loss' la barra baja un poco más rápido (500ms, §3) y nunca brilla; en 'gain' se
  // llena en 800ms y hace shimmer al final.
  const fillDuration = mode === 'loss' ? 'duration-[500ms]' : 'duration-[800ms]';

  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-border bg-love-soft">
        <div
          className={`h-full ${fillColor} transition-[width] ${fillDuration} ease-[var(--ease-out-soft)] ${
            shimmer ? 'animate-bar-shimmer' : ''
          }`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className={`mt-1 text-xs ${atRisk ? 'text-risk-strong' : 'text-love'}`}>
        💕 {shownCurrent}/{progress.total} para Nivel {character.level + 1}
      </p>
    </div>
  );
}
