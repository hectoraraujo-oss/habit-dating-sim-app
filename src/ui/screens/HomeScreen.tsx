// Pantalla 1: Home — grid de 3 slots + misiones pendientes (flujo-pantallas.md).

import type { Character, GameState, Mission, SlotNumber } from '../../types';
import { SLOT_NUMBERS } from '../../game/constants';
import { activeCharacters, isAtRisk } from '../../game/engine';
import { DIFFICULTY_ICON, formatDeadline, formatLongDate } from '../format';
import { HeartsBar } from '../components/HeartsBar';
import { Sprite } from '../components/Sprite';

interface HomeScreenProps {
  state: GameState;
  today: string;
  onOpenProfile: (characterId: string) => void;
  onCreateCharacter: () => void;
  onCreateMission: (characterId: string) => void;
  onOpenMission: (missionId: string) => void;
}

export function HomeScreen({
  state,
  today,
  onOpenProfile,
  onCreateCharacter,
  onCreateMission,
  onOpenMission,
}: HomeScreenProps) {
  const active = activeCharacters(state);
  const noCharacters = active.length === 0;

  // Personajes en riesgo aparecen primero, el resto conserva su orden de slot
  const orderedSlots: (Character | SlotNumber)[] = [
    ...active.filter((c) => isAtRisk(c, today)),
    ...active.filter((c) => !isAtRisk(c, today)).sort((a, b) => (a.slotNumber ?? 0) - (b.slotNumber ?? 0)),
    ...SLOT_NUMBERS.filter((slot) => !active.some((c) => c.slotNumber === slot)),
  ];

  const pending = state.missions
    .filter((m) => m.status === 'pending')
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <div className="flex min-h-svh flex-col bg-pink-50">
      <header className="flex items-center justify-between border-b-4 border-pink-200 bg-white px-4 py-3">
        <h1 className="font-mono text-lg font-bold tracking-tight text-pink-600">💕 Habit Dating Sim</h1>
        <span className="text-sm text-stone-500">{formatLongDate(today)}</span>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {noCharacters && (
          <p className="mb-4 text-center text-sm text-stone-500">
            Tus relaciones aparecen aquí. Empieza creando una.
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {orderedSlots.map((slot) =>
            typeof slot === 'number' ? (
              <button
                key={`empty-${slot}`}
                onClick={onCreateCharacter}
                className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pink-300 bg-white/60 p-4 text-pink-400 transition hover:border-pink-400 hover:text-pink-500"
              >
                <span className="text-4xl">+</span>
                <span className="text-sm font-medium">
                  {noCharacters ? 'Crea tu primer personaje' : 'Crear personaje'}
                </span>
              </button>
            ) : (
              <CharacterCard
                key={slot.id}
                character={slot}
                atRisk={isAtRisk(slot, today)}
                onOpen={() => onOpenProfile(slot.id)}
                onCreateMission={() => onCreateMission(slot.id)}
              />
            ),
          )}
        </div>

        {!noCharacters && (
          <section className="mt-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-500">
              Misiones pendientes
            </h2>
            {pending.length === 0 ? (
              <p className="rounded-lg bg-white p-4 text-sm text-stone-400">
                Sin misiones pendientes. Crea una desde la card de un personaje.
              </p>
            ) : (
              <ul className="space-y-2">
                {pending.map((mission) => (
                  <MissionRow
                    key={mission.id}
                    mission={mission}
                    characterName={state.characters.find((c) => c.id === mission.characterId)?.name ?? '?'}
                    today={today}
                    onOpen={() => onOpenMission(mission.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      <footer className="border-t-4 border-pink-200 bg-white px-4 py-2">
        <nav className="mx-auto flex max-w-2xl items-center gap-4">
          <span className="text-xl" title="Home">
            🏠
          </span>
          {active.map((character) => (
            <button
              key={character.id}
              onClick={() => onOpenProfile(character.id)}
              className="flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700 transition hover:bg-pink-200"
            >
              <Sprite character={character} size={20} />
              {character.name}
            </button>
          ))}
        </nav>
      </footer>
    </div>
  );
}

function CharacterCard({
  character,
  atRisk,
  onOpen,
  onCreateMission,
}: {
  character: Character;
  atRisk: boolean;
  onOpen: () => void;
  onCreateMission: () => void;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border-2 bg-white p-4 ${
        atRisk ? 'border-orange-400' : 'border-pink-200'
      }`}
    >
      <button onClick={onOpen} className="flex flex-col items-center gap-2">
        <Sprite character={character} size={80} sad={atRisk} />
        <span className="font-semibold text-stone-700">{character.name}</span>
        <span className="text-xs text-stone-500">Nivel {character.level}</span>
      </button>
      {character.level === 3 && (
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          ✓ Consolidado
        </span>
      )}
      {atRisk && (
        <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
          ⚠ Necesita atención
        </span>
      )}
      <div className="w-full">
        <HeartsBar character={character} atRisk={atRisk} />
      </div>
      <button
        onClick={onCreateMission}
        className="mt-1 w-full rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-pink-600"
      >
        + misión
      </button>
    </div>
  );
}

function MissionRow({
  mission,
  characterName,
  today,
  onOpen,
}: {
  mission: Mission;
  characterName: string;
  today: string;
  onOpen: () => void;
}) {
  const deadlineLabel = formatDeadline(mission.deadline, today);
  return (
    <li>
      <button
        onClick={onOpen}
        className="flex w-full items-center justify-between rounded-lg border border-pink-200 bg-white px-3 py-2 text-left transition hover:border-pink-400"
      >
        <span className="flex items-center gap-2">
          <span className="text-pink-500">●</span>
          <span className="text-sm font-medium text-stone-700">{mission.name}</span>
          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500">{characterName}</span>
        </span>
        <span className="flex items-center gap-2 text-xs text-stone-500">
          <span className={deadlineLabel === 'hoy' || deadlineLabel === 'vencida' ? 'font-semibold text-orange-600' : ''}>
            {deadlineLabel}
          </span>
          <span title={mission.difficulty}>{DIFFICULTY_ICON[mission.difficulty]}</span>
        </span>
      </button>
    </li>
  );
}
