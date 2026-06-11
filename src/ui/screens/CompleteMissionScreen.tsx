// Pantalla 4: Marcar misión completa — el ritual del "✓ Lo hice" (flujo-pantallas.md).
// Nota: si la misión ya venció, el motor la marca como failed con penalización
// (qa-report TC-024/TC-040) — esta pantalla muestra esa advertencia.

import type { Character, Mission } from '../../types';
import { CANCEL_PENALTY, HEARTS_BY_DIFFICULTY } from '../../game/constants';
import { daysBetween } from '../../game/dates';
import { DIFFICULTY_LABEL, formatDeadline } from '../format';
import { Sprite } from '../components/Sprite';

interface CompleteMissionScreenProps {
  mission: Mission;
  character: Character;
  today: string;
  onComplete: () => void;
  onCancelMission: () => void;
  onDeleteMission: () => void;
  onBack: () => void;
}

export function CompleteMissionScreen({
  mission,
  character,
  today,
  onComplete,
  onCancelMission,
  onDeleteMission,
  onBack,
}: CompleteMissionScreenProps) {
  const expired = daysBetween(mission.deadline, today) > 0;
  const reward = HEARTS_BY_DIFFICULTY[mission.difficulty];
  const penalty = CANCEL_PENALTY[mission.difficulty];

  return (
    <div className="flex min-h-svh flex-col bg-pink-50">
      <header className="border-b-4 border-pink-200 bg-white px-4 py-3">
        <button onClick={onBack} className="text-sm font-medium text-pink-600 hover:underline">
          ← Volver
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-8 text-center">
        <h1 className="text-xl font-bold text-stone-800">{mission.name}</h1>
        <p className={`mt-1 text-sm ${expired ? 'font-semibold text-red-600' : 'text-stone-500'}`}>
          {character.name} · {DIFFICULTY_LABEL[mission.difficulty]} ·{' '}
          {expired ? `venció el ${mission.deadline}` : `vence ${formatDeadline(mission.deadline, today)}`}
        </p>

        <div className="my-8">
          <Sprite character={character} size={128} sad={expired} />
        </div>

        {expired ? (
          <>
            <p className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              Esta misión venció. Ya no se puede completar: el sistema la dará por perdida con una
              penalización de −{penalty} 💕.
            </p>
            <button
              onClick={onComplete}
              className="w-full max-w-xs rounded-2xl bg-stone-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-stone-600"
            >
              Aceptar la pérdida
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onComplete}
              className="w-full max-w-xs rounded-2xl bg-pink-500 px-6 py-6 text-2xl font-extrabold text-white shadow-lg transition hover:scale-[1.02] hover:bg-pink-600"
            >
              ✓ LO HICE
            </button>
            <p className="mt-3 text-sm text-stone-600">+{reward} 💕 al confirmar</p>

            <button
              onClick={onCancelMission}
              className="mt-10 text-sm text-stone-400 underline transition hover:text-stone-600"
            >
              cancelar esta misión (−{penalty} 💕)
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Borrar esta misión? Desaparece sin afectar tus corazones ni tu nivel.')) {
                  onDeleteMission();
                }
              }}
              className="mt-2 text-xs text-stone-300 underline transition hover:text-stone-500"
            >
              🗑 borrar esta misión (sin penalización)
            </button>
          </>
        )}
      </main>
    </div>
  );
}
