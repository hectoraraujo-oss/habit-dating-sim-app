// Pantalla 4: Marcar misión completa — el ritual del "✓ Lo hice" (flujo-pantallas.md).
// Decisión P4 de Hector (2026-06-12) — derecho de réplica: si la misión ya venció, el
// usuario elige entre "Sí lo hice (tarde)" (completa con recompensa reducida por el
// multiplicador de mecanicas-detalle §4) o "Aceptar la pérdida" (failed + penalización
// + escena de cancelación, el flujo que antes era automático).

import type { Character, Mission } from '../../types';
import { CANCEL_PENALTY, HEARTS_BY_DIFFICULTY } from '../../game/constants';
import { daysBetween } from '../../game/dates';
import { calcHeartsEarned } from '../../game/hearts';
import { DIFFICULTY_LABEL, formatDeadline } from '../format';
import { Sprite } from '../components/Sprite';

interface CompleteMissionScreenProps {
  mission: Mission;
  character: Character;
  today: string;
  onComplete: () => void;
  onAcceptLoss: () => void;
  onCancelMission: () => void;
  onBack: () => void;
}

export function CompleteMissionScreen({
  mission,
  character,
  today,
  onComplete,
  onAcceptLoss,
  onCancelMission,
  onBack,
}: CompleteMissionScreenProps) {
  const expired = daysBetween(mission.deadline, today) > 0;
  const reward = HEARTS_BY_DIFFICULTY[mission.difficulty];
  // Recompensa reducida si se completa tarde (preview del derecho de réplica)
  const lateReward = calcHeartsEarned(mission.difficulty, mission.deadline, today);
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
              Esta misión venció. Llegó tarde, pero vale la pena cumplir: ganarás menos corazones.
            </p>
            <button
              onClick={onComplete}
              className="w-full max-w-xs rounded-2xl bg-pink-500 px-6 py-5 text-xl font-extrabold text-white shadow-lg transition hover:scale-[1.02] hover:bg-pink-600"
            >
              ✓ SÍ LO HICE (TARDE)
            </button>
            <p className="mt-3 text-sm text-stone-600">+{lateReward} 💕 por completar con retraso</p>
            <button
              onClick={onAcceptLoss}
              className="mt-8 w-full max-w-xs rounded-2xl bg-stone-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-stone-600"
            >
              Aceptar la pérdida (−{penalty} 💕)
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
          </>
        )}
      </main>
    </div>
  );
}
