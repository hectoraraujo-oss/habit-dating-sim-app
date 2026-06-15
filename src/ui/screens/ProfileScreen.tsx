// Pantalla 2: Perfil de personaje — detalle, estadísticas e historial (flujo-pantallas.md).

import { useMemo, useState } from 'react';
import type { Character, GameState, Mission } from '../../types';
import {
  completedMissionsCount,
  daysInactive,
  daysTogether,
  daysUntilLeaving,
  isAtRisk,
  riskLevel,
} from '../../game/engine';
import { reactionFor } from '../../game/reaction';
import { DIFFICULTY_LABEL, formatDeadline, formatShortDate, LEVEL_STAGE } from '../format';
import { HeartsBar } from '../components/HeartsBar';
import { ReactiveBubble } from '../components/ReactiveBubble';
import { Sprite } from '../components/Sprite';

interface ProfileScreenProps {
  state: GameState;
  character: Character;
  today: string;
  onBack: () => void;
  onCreateMission: () => void;
  onOpenMission: (missionId: string) => void;
  onDeleteCharacter: () => void;
}

export function ProfileScreen({
  state,
  character,
  today,
  onBack,
  onCreateMission,
  onOpenMission,
  onDeleteCharacter,
}: ProfileScreenProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  // R2 idle: el Perfil es el hogar principal de la línea reactiva (spec §5). Una variante
  // estable por apertura (rota por día para no repetir la misma frase siempre).
  const reaction = useMemo(() => {
    const variantIndex = daysTogether(character, today);
    return reactionFor(character, state.missions, today, { variantIndex });
  }, [character, state.missions, today]);
  const missions = state.missions.filter((m) => m.characterId === character.id);
  const pending = missions
    .filter((m) => m.status === 'pending')
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const finished = missions
    .filter((m) => m.status !== 'pending')
    .sort((a, b) => (b.completedDate ?? b.deadline).localeCompare(a.completedDate ?? a.deadline));
  const cancelledCount = missions.filter((m) => m.status === 'cancelled' || m.status === 'failed').length;
  const noMissions = missions.length === 0;

  // Banner de riesgo (dirección-visual.md §5): días sin verse + cuántos quedan antes de que
  // se vaya. Tono tristeza, NUNCA culpa ("le fallaste"). Naranja, nunca rojo. Escala a
  // --color-risk-strong en días 18-20 (muy cerca del abandono a los 21).
  const atRisk = isAtRisk(character, today);
  const inactiveDays = daysInactive(character, today);
  const risk = riskLevel(inactiveDays);
  const daysLeft = daysUntilLeaving(inactiveDays);

  return (
    <div className="flex min-h-svh flex-col bg-pink-50">
      <header className="border-b-4 border-pink-200 bg-white px-4 py-3">
        <button onClick={onBack} className="text-sm font-medium text-pink-600 hover:underline">
          ← Volver
        </button>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        <section className="flex flex-col items-center gap-2 rounded-xl border-2 border-pink-200 bg-white p-6">
          {/* Respiración idle en reposo normal; si está en riesgo, suspira en vez de respirar. */}
          <Sprite
            character={character}
            size={128}
            sad={reaction.sprite === 'sad'}
            sigh={atRisk}
            idle={!atRisk}
          />
          <h1 className="text-xl font-bold text-stone-800">{character.name}</h1>
          <p className="text-sm text-stone-500">
            Nivel {character.level} — {LEVEL_STAGE[character.level]}
          </p>
          <div className="w-full max-w-xs">
            <HeartsBar character={character} />
          </div>
          <p className="text-xs text-stone-400">
            Juntos desde {formatShortDate(character.createdDate)} · {daysTogether(character, today)} días juntos
          </p>

          {/* R2 idle: línea reactiva del personaje (2da persona) + marco opcional de Cupido.
              Presentación unificada en ReactiveBubble (§2 principio 5). */}
          <ReactiveBubble
            characterLine={reaction.characterLine}
            cupidoLine={reaction.cupidoLine}
            className="mt-2 w-full max-w-sm"
          />
        </section>

        {atRisk && (
          <div
            className={`mt-3 flex items-start gap-3 rounded-card border-2 px-4 py-3 ${
              risk === 'strong'
                ? 'border-risk-strong bg-orange-50 animate-risk-breathe-strong'
                : 'border-risk bg-orange-50/70 animate-risk-breathe'
            }`}
          >
            <span className="text-xl">🕊️</span>
            <p
              className={`text-sm leading-snug ${
                risk === 'strong' ? 'font-semibold text-risk-strong' : 'text-risk'
              }`}
            >
              {character.name} lleva {inactiveDays} {inactiveDays === 1 ? 'día' : 'días'} sin verte.
              {daysLeft > 0
                ? ` Le ${daysLeft === 1 ? 'queda' : 'quedan'} ${daysLeft} ${
                    daysLeft === 1 ? 'día' : 'días'
                  } antes de marcharse.`
                : ' Está a punto de marcharse.'}
            </p>
          </div>
        )}

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

        <div className="mt-8 text-center">
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-stone-400 underline transition hover:text-red-500"
          >
            Eliminar personaje
          </button>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t-4 border-pink-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={onCreateMission}
            className="w-full rounded-cta bg-primary px-4 py-3 font-bold text-white shadow-cta transition hover:bg-primary-press"
          >
            + Crear nueva misión
          </button>
        </div>
      </footer>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-xl">
            <p className="text-sm text-stone-700">
              ¿Seguro que quieres eliminar a {character.name}? Esto borrará el personaje y todos sus
              hábitos para siempre.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                onClick={onDeleteCharacter}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
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
        {DIFFICULTY_LABEL[mission.difficulty]} · {formatShortDate(mission.completedDate ?? mission.deadline)} {hearts}
      </span>
    </li>
  );
}
