// Pantalla 5: Escena de nivel — celebración MAYOR (clímax del 80%); con variante de BODA al
// llegar a nivel 3 (flujo-pantallas.md + bubble-decisions Workflow 4).
//
// Fase 4 Ola 3 (dirección-visual.md §3 "Subir de nivel (celebración mayor)"):
//   - el fondo de escena hace fade-in (~300ms): "entramos a otro lugar", no popup;
//   - la imagen de escena entra cinematográfica scale(1.04 -> 1) en ~600ms;
//   - el título display entra con happy-pop + glow (--shadow-celebrate);
//   - burst de ~14 corazones desde el centro (stagger ~40ms), CSS puro (HeartBurst).
// La BODA amplifica la MISMA pantalla: ~50% más partículas, mezcla 💍/💕, título amber, y
// el glow pulsa 2 veces. NO es otra pantalla: es esta misma, subida de intensidad.
//
// prefers-reduced-motion: colapsa a un fade simple (sin burst). El burst NO se monta.

import type { Character, GameState, Level } from '../../types';
import { completedMissionsCount, daysTogether } from '../../game/engine';
import { LEVEL_STAGE } from '../format';
import { levelSceneFor } from '../sprites';
import { HeartBurst } from '../components/HeartBurst';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LevelSceneProps {
  state: GameState;
  character: Character;
  newLevel: Level;
  wedding: boolean;
  today: string;
  onContinue: () => void;
}

const NARRATIVE: Record<number, string> = {
  1: '"Oye… creo que ya no somos extraños. Me gusta esto."',
  2: '"Llevas semanas cuidándome. No lo olvidaré."',
};

export function LevelScene({ state, character, newLevel, wedding, today, onContinue }: LevelSceneProps) {
  const days = daysTogether(character, today);
  const completed = completedMissionsCount(state, character.id);
  const reduced = useReducedMotion();

  // Glow del título: un pulso normal; en boda pulsa dos veces (amber). Con reduced-motion
  // el guard CSS global ya colapsa la animación, así que dejamos la clase sin condicionar.
  const titleAnim = wedding ? 'animate-title-glow-wedding' : 'animate-title-glow';

  return (
    <div className="animate-scene-fade-in flex min-h-svh flex-col items-center bg-scene-dark px-4 py-6 text-center text-white">
      <div className="relative w-full max-w-2xl">
        <img
          src={levelSceneFor(newLevel)}
          alt={wedding ? 'Escena de boda' : `Escena de nivel ${newLevel}`}
          className="animate-scene-image-in max-h-[55svh] w-full rounded-card object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 py-6">
        {/* Burst radial de corazones desde el centro del bloque de título. No se monta con
            prefers-reduced-motion (colapsar a fade simple, sin parpadeo de partículas). */}
        {!reduced && <HeartBurst wedding={wedding} />}

        {wedding ? (
          <>
            <h1 className={`${titleAnim} relative font-display text-3xl font-extrabold text-milestone`}>
              💍 ¡Boda!
            </h1>
            <p className="text-lg font-semibold text-pink-300">
              {character.name} — {LEVEL_STAGE[3]}
            </p>
            <p className="max-w-md text-stone-300">
              "Lo lograste. {days} días y nunca me soltaste. Este hábito ya es parte de ti — y yo
              también. Hasta siempre."
            </p>
            <p className="text-sm text-stone-400">
              Tu historia queda guardada en Happy Endings. La habitación queda libre.
            </p>
          </>
        ) : (
          <>
            <h1 className={`${titleAnim} relative font-display text-2xl font-extrabold text-pink-300`}>
              ★ Nivel {newLevel} alcanzado
            </h1>
            <p className="text-lg font-semibold text-stone-200">{LEVEL_STAGE[newLevel]}</p>
            <p className="max-w-md text-stone-300">{NARRATIVE[newLevel] ?? ''}</p>
          </>
        )}
        <p className="text-sm text-stone-400">
          {days} días juntos · {completed} misiones completadas
        </p>
      </div>

      <button
        onClick={onContinue}
        className="mb-4 w-full max-w-xs rounded-cta bg-primary px-4 py-3 font-bold text-white shadow-cta transition hover:bg-primary-press"
      >
        Continuar
      </button>
    </div>
  );
}
