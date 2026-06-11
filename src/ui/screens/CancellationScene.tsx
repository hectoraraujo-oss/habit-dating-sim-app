// Pantalla 7: Escena de cancelación — penalización ya aplicada al llegar aquí;
// "Entendido" solo navega de vuelta (flujo-pantallas.md).

import type { Character, Mission } from '../../types';
import { DIFFICULTY_LABEL } from '../format';
import { HeartsBar } from '../components/HeartsBar';
import { Sprite } from '../components/Sprite';

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

  return (
    <div className="flex min-h-svh flex-col items-center bg-stone-100 px-4 py-10 text-center">
      <Sprite character={character} size={112} sad />

      <p className="mt-6 max-w-md text-lg text-stone-700">
        {auto
          ? '"Esperé hasta la fecha límite y no llegaste. Eso también cuenta…"'
          : '"Okay. Lo entiendo. Pero ya sabes lo que cuesta esto."'}
      </p>

      <div className="mt-6 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-600">
        <p>
          {auto ? 'Venció:' : 'Cancelaste:'} <strong>{mission.name}</strong>
        </p>
        <p>Dificultad: {DIFFICULTY_LABEL[mission.difficulty]}</p>
      </div>

      <p className="mt-6 text-3xl font-extrabold text-red-500">−{penalty} 💕</p>

      <div className="mt-4 w-full max-w-xs">
        <HeartsBar character={character} />
      </div>

      {atZero && (
        <p className="mt-4 max-w-md text-sm font-semibold text-red-600">
          Esto está en el límite. Si dejas de atender a {character.name}, podría irse.
        </p>
      )}

      <button
        onClick={onClose}
        className="mt-8 w-full max-w-xs rounded-xl bg-stone-700 px-4 py-3 font-bold text-white transition hover:bg-stone-600"
      >
        {atZero ? 'Entendido. No lo olvidaré.' : 'Entendido'}
      </button>
    </div>
  );
}
