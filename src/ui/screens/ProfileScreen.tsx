// Pantalla 2: Perfil de personaje — detalle, estadísticas e historial (flujo-pantallas.md).

import type { Character, GameState, Mission } from '../../types';
import { completedMissionsCount, daysTogether } from '../../game/engine';
import { DIFFICULTY_LABEL, formatDeadline, LEVEL_STAGE } from '../format';
import { HeartsBar } from '../components/HeartsBar';
import { Sprite } from '../components/Sprite';

interface ProfileScreenProps {
  state: GameState;
  character: Character;
  today: string;
  onBack: () => void;
  onCreateMission: () => void;
  onOpenMission: (missionId: string) => void;
}

export function ProfileScreen({
  state,
  character,
  today,
  onBack,
  onCreateMission,
  onOpenMission,
}: ProfileScreenProps) {
  const missions = state.missions.filter((m) => m.characterId === character.id);
  const pending = missions
    .filter((m) => m.status === 'pending')
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const finished = missions
    .filter((m) => m.status !== 'pending')
    .sort((a, b) => (b.completedDate ?? b.deadline).localeCompare(a.completedDate ?? a.deadline));
  const cancelledCount = missions.filter((m) => m.status === 'cancelled' || m.status === 'failed').length;
  const noMissions = missions.length === 0;

  return (
    <div className="flex min-h-svh flex-col bg-pink-50">
      <header className="border-b-4 border-pink-200 bg-white px-4 py-3">
        <button onClick={onBack} className="text-sm font-medium text-pink-600 hover:underline">
          ← Volver
        </button>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        <section className="flex flex-col items-center gap-2 rounded-xl border-2 border-pink-200 bg-white p-6">
          <Sprite character={character} size={128} />
          <h1 className="text-xl font-bold text-stone-800">{character.name}</h1>
          <p className="text-sm text-stone-500">
            Nivel {character.level} — {LEVEL_STAGE[character.level]}
          </p>
          <div className="w-full max-w-xs">
            <HeartsBar character={character} />
          </div>
          <p className="text-xs text-stone-400">
            Juntos desde {character.createdDate} · {daysTogether(character, today)} días juntos
          </p>
        </section>

        <section className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat value={`✓ ${completedMissionsCount(state, character.id)}`} label="completadas" />
          <Stat value={`💕 ${character.heartsTotal}`} label="corazones" />
          <Stat value={`✗ ${cancelledCount}`} label="canceladas" />
        </section>

        <section className="mt-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-500">Historial</h2>
          {noMissions ? (
            <p className="rounded-lg bg-white p-5 text-center text-sm text-stone-500">
              Crea tu primera misión. Las relaciones se construyen con acciones, no con intenciones.
            </p>
          ) : (
            <ul className="space-y-2">
              {pending.map((mission) => (
                <li key={mission.id}>
                  <button
                    onClick={() => onOpenMission(mission.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-left transition hover:border-amber-400"
                  >
                    <span className="text-sm font-medium text-stone-700">⏳ {mission.name}</span>
                    <span className="text-xs text-stone-500">
                      {DIFFICULTY_LABEL[mission.difficulty]} · vence {formatDeadline(mission.deadline, today)}
                    </span>
                  </button>
                </li>
              ))}
              {finished.map((mission) => (
                <HistoryRow key={mission.id} mission={mission} />
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="sticky bottom-0 border-t-4 border-pink-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={onCreateMission}
            className="w-full rounded-xl bg-pink-500 px-4 py-3 font-bold text-white transition hover:bg-pink-600"
          >
            + Crear nueva misión
          </button>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-pink-200 bg-white px-2 py-3">
      <p className="font-bold text-stone-700">{value}</p>
      <p className="text-xs text-stone-400">{label}</p>
    </div>
  );
}

function HistoryRow({ mission }: { mission: Mission }) {
  const styles: Record<string, { icon: string; text: string }> = {
    completed: { icon: '✓', text: 'text-green-600' },
    cancelled: { icon: '✗', text: 'text-stone-400' },
    failed: { icon: '✗', text: 'text-stone-400' },
  };
  const style = styles[mission.status] ?? styles.cancelled;
  const hearts =
    mission.heartsAwarded === null
      ? ''
      : mission.heartsAwarded >= 0
        ? `+${mission.heartsAwarded}💕`
        : `${mission.heartsAwarded}💕`;

  return (
    <li className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2">
      <span className={`text-sm ${style.text}`}>
        {style.icon} {mission.name}
      </span>
      <span className="text-xs text-stone-400">
        {DIFFICULTY_LABEL[mission.difficulty]} · {mission.completedDate ?? mission.deadline} {hearts}
      </span>
    </li>
  );
}
