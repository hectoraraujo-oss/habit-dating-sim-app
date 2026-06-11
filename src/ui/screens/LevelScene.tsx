// Pantalla 5: Escena de nivel — celebración inmersiva; con variante de BODA al
// llegar a nivel 3 (flujo-pantallas.md + bubble-decisions Workflow 4).

import type { Character, GameState, Level } from '../../types';
import { completedMissionsCount, daysTogether } from '../../game/engine';
import { LEVEL_STAGE } from '../format';
import { levelSceneFor } from '../sprites';

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

  return (
    <div className="flex min-h-svh flex-col items-center bg-stone-900 px-4 py-6 text-center text-white">
      <img
        src={levelSceneFor(newLevel)}
        alt={wedding ? 'Escena de boda' : `Escena de nivel ${newLevel}`}
        className="max-h-[55svh] w-full max-w-2xl rounded-xl object-cover"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
        {wedding ? (
          <>
            <h1 className="text-2xl font-extrabold text-amber-300">💍 ¡Boda!</h1>
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
            <h1 className="text-2xl font-extrabold text-pink-300">★ Nivel {newLevel} alcanzado</h1>
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
        className="mb-4 w-full max-w-xs rounded-xl bg-pink-500 px-4 py-3 font-bold text-white transition hover:bg-pink-600"
      >
        Continuar
      </button>
    </div>
  );
}
