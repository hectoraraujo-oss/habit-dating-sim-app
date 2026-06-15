// Pantalla 7: Escena de cancelación — penalización ya aplicada al llegar aquí;
// "Entendido" solo navega de vuelta (flujo-pantallas.md).
//
// Fase 4 Ola 2 (dirección-visual.md §3, "Asimetría 80/20"): el LADO SOBRIO. La pérdida se
// siente, no se celebra. NUNCA partículas, NUNCA overshoot, NUNCA glow, NUNCA shimmer. El
// "−X 💕" hace fade-in lento (~400ms, --ease-in-quiet) y UN único descenso del número
// (count-down). La hearts bar baja con transition-[width] y se queda. La ilustración vira a
// grayscale con transición ~300ms (no salta, no pop). Rojo apagado (--color-danger) SOLO en
// el número de la pérdida. Regla dura: la pérdida nunca dura ni brilla más que la ganancia.

import { useEffect, useState } from 'react';
import type { Character, Mission } from '../../types';
import { DIFFICULTY_LABEL } from '../format';
import { HeartsBar } from '../components/HeartsBar';
import { CANCELLATION_SCENE } from '../sprites';

interface CancellationSceneProps {
  character: Character;
  mission: Mission;
  // true cuando fue cancelación automática por deadline vencido
  auto: boolean;
  onClose: () => void;
}

export function CancellationScene({ character, mission, auto, onClose }: CancellationSceneProps) {
  const penalty = Math.abs(mission.heartsAwarded ?? 0);
  const atZero = character.heartsTotal === 0;

  // El character que llega ya trae heartsTotal DESPUÉS de la penalización; el "antes" se
  // deriva sumando la penalización de vuelta (paralelo a MissionResultScreen en la ganancia).
  const heartsBefore = character.heartsTotal + penalty;

  // Fade-in lento del número de pérdida (--ease-in-quiet, opacity 400ms). El número se QUEDA
  // en −penalty: no cuenta a cero (perder 0 corazones no tendría sentido). El "descenso"
  // visible de la asimetría sobria es el de la hearts bar, que drena de heartsBefore a
  // heartsTotal en modo 'loss'. `revealed` (rAF, inmediato) dispara el fade-in.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const raf =
      typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => setRevealed(true)) : 0;
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center bg-stone-100 px-4 py-6 text-center">
      {/* La ilustración vira a grayscale con una transición de ~300ms — no salta, no pop. */}
      <img
        src={CANCELLATION_SCENE}
        alt="Escena de cancelación"
        className="max-h-[45svh] w-full max-w-2xl rounded-card object-cover grayscale transition-[filter] duration-[300ms] ease-[var(--ease-in-quiet)]"
        style={{ imageRendering: 'pixelated' }}
      />

      <p className="mt-6 max-w-md text-lg text-ink">
        {auto
          ? '"Esperé hasta la fecha límite y no llegaste. Eso también cuenta…"'
          : '"Okay. Lo entiendo. Pero ya sabes lo que cuesta esto."'}
      </p>

      <div className="mt-6 rounded-card border border-border bg-surface px-4 py-3 text-sm text-ink-soft">
        <p>
          {auto ? 'Venció:' : 'Cancelaste:'} <strong>{mission.name}</strong>
        </p>
        <p>Dificultad: {DIFFICULTY_LABEL[mission.difficulty]}</p>
      </div>

      {/* −X 💕: fade-in lento + descenso del número. Rojo apagado SOLO aquí. Sin glow/shimmer. */}
      <p
        className="mt-6 font-display text-3xl font-extrabold text-danger transition-opacity duration-[400ms] ease-[var(--ease-in-quiet)]"
        style={{ opacity: revealed ? 1 : 0 }}
      >
        −{penalty} 💕
      </p>

      <div className="mt-4 w-full max-w-xs">
        {/* La barra BAJA (modo 'loss'): mismo conteo/transición, sin shimmer. */}
        <HeartsBar character={character} animateFromHearts={heartsBefore} mode="loss" />
      </div>

      {atZero && (
        <p className="mt-4 max-w-md text-sm font-semibold text-danger">
          Esto está en el límite. Si dejas de atender a {character.name}, podría irse.
        </p>
      )}

      <button
        onClick={onClose}
        className="mt-8 w-full max-w-xs rounded-cta bg-stone-700 px-4 py-3 font-bold text-white transition hover:bg-stone-600"
      >
        {atZero ? 'Entendido. No lo olvidaré.' : 'Entendido'}
      </button>
    </div>
  );
}
