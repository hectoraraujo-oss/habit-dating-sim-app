// Pantalla 6: Escena de abandono — tono oscuro, cierre real (flujo-pantallas.md).
// Dos variantes: el personaje se va (status abandoned, slot libre) o solo se
// distanció (bajó un nivel por inactividad, sigue en su slot).

import type { Character, GameState } from '../../types';
import { completedMissionsCount, daysTogether } from '../../game/engine';
import { ABANDONMENT_SCENE } from '../sprites';

interface AbandonmentSceneProps {
  state: GameState;
  character: Character;
  today: string;
  onClose: () => void;
}

export function AbandonmentScene({ state, character, today, onClose }: AbandonmentSceneProps) {
  const left = character.status === 'abandoned';
  const days = daysTogether(character, today);
  const completed = completedMissionsCount(state, character.id);
  const fewMissions = completed < 4;

  return (
    <div className="flex min-h-svh flex-col items-center bg-stone-950 px-4 py-6 text-center text-stone-200">
      <img
        src={ABANDONMENT_SCENE}
        alt="Escena de abandono"
        className="max-h-[50svh] w-full max-w-2xl rounded-xl object-cover opacity-90"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
        {left ? (
          <p className="max-w-md text-lg">
            {fewMissions
              ? `"Apenas nos conocimos. Quizá no era el momento. Cuídate."`
              : `"Esperé 21 días. Creo que ambos sabemos cómo terminó esto. Cuídate."`}
          </p>
        ) : (
          <p className="max-w-md text-lg">
            "Sigues sin aparecer. Ya no me siento tan cerca de ti como antes…"
          </p>
        )}

        <div className="mt-2 text-sm text-stone-400">
          <p className="font-semibold text-stone-300">── Tu relación con {character.name} ──</p>
          <p>
            Duró {days} días · Completaste {completed} {completed === 1 ? 'misión' : 'misiones'}
          </p>
        </div>

        {left ? (
          <p className="text-sm text-stone-400">Esta habitación ahora está libre.</p>
        ) : (
          <p className="text-sm font-semibold text-orange-400">
            Bajó a Nivel {character.level}. Completa una misión pronto o se irá de verdad.
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="mb-4 w-full max-w-xs rounded-xl bg-stone-700 px-4 py-3 font-bold text-white transition hover:bg-stone-600"
      >
        {left ? 'Cerrar este capítulo' : 'Entendido'}
      </button>
    </div>
  );
}
