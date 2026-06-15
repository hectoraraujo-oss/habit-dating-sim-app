// Pantalla 1: Home — grid de 3 slots + misiones pendientes (flujo-pantallas.md).

import { useEffect, useRef, useState } from 'react';
import type { Character, GameState, Mission, SlotNumber } from '../../types';
import { SLOT_NUMBERS } from '../../game/constants';
import { daysBetween } from '../../game/dates';
import { activeCharacters, daysInactive, isAtRisk, riskLevel } from '../../game/engine';
import type { RiskLevel } from '../../game/engine';
import { reactionFor } from '../../game/reaction';
import { DIFFICULTY_ICON, formatDeadline, formatLongDate } from '../format';
import { HeartsBar } from '../components/HeartsBar';
import { Sprite } from '../components/Sprite';

// Cada cuántos días sin respaldar vuelve a sugerirse exportar (nudge de respaldo, ICE 504).
const BACKUP_NUDGE_DAYS = 14;

interface HomeScreenProps {
  state: GameState;
  today: string;
  // Personaje recién creado: su card hace el aterrizaje de "nacimiento" una sola vez al
  // aparecer (dirección-visual.md §3 "Crear personaje"). null si no hay ninguno nuevo.
  justBornId?: string | null;
  // Se llama una vez consumido el aterrizaje, para que App limpie el flag (no se repita).
  onBirthSeen?: () => void;
  onOpenProfile: (characterId: string) => void;
  onCreateCharacter: () => void;
  onCreateMission: (characterId: string) => void;
  onOpenMission: (missionId: string) => void;
  onOpenData: () => void;
}

export function HomeScreen({
  state,
  today,
  justBornId = null,
  onBirthSeen,
  onOpenProfile,
  onCreateCharacter,
  onCreateMission,
  onOpenMission,
  onOpenData,
}: HomeScreenProps) {
  const active = activeCharacters(state);
  const noCharacters = active.length === 0;

  // El id recién nacido se captura UNA vez al montar (initializer perezoso de useState, que SÍ
  // puede leerse en render): así el aterrizaje (animación CSS que corre una vez) usa un valor
  // estable y no se interrumpe si el padre limpia su flag en mitad de la animación. HomeScreen
  // se remonta al volver de "crear personaje", así que nace con el id nuevo en ese flujo. NO
  // se vuelve a llamar setBornId (sin setState en efecto; regla del plugin react-hooks).
  const [bornId] = useState(() => justBornId);
  // Avisamos al padre, una sola vez, que ya consumimos el aterrizaje (para que no se repita en
  // futuras visitas al Home). El efecto SOLO llama al callback: sin setState local. El callback
  // se lee desde un ref para que el efecto dependa solo del id (no de la identidad del callback).
  const onBirthSeenRef = useRef(onBirthSeen);
  useEffect(() => {
    onBirthSeenRef.current = onBirthSeen;
  });
  useEffect(() => {
    if (bornId) onBirthSeenRef.current?.();
  }, [bornId]);

  // Nudge de respaldo (ICE 504, mitiga el riesgo #1: pérdida de datos de localStorage).
  // Se invita a respaldar si hay al menos un personaje Y nunca se exportó (lastExportDate
  // null) o pasaron más de 14 días desde el último respaldo. Descartable solo en memoria
  // (no se persiste): vuelve a aparecer en la próxima apertura si la condición sigue.
  const [backupNudgeDismissed, setBackupNudgeDismissed] = useState(false);
  const daysSinceExport =
    state.lastExportDate === null ? null : daysBetween(state.lastExportDate, today);
  const showBackupNudge =
    !backupNudgeDismissed &&
    active.length >= 1 &&
    (daysSinceExport === null || daysSinceExport > BACKUP_NUDGE_DAYS);

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

        {showBackupNudge && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
            <span className="text-xl">💾</span>
            <p className="flex-1 text-xs leading-snug text-sky-800">
              {state.lastExportDate === null
                ? 'Tus avances viven solo en este navegador. Cuando puedas, guarda un respaldo para no perder a nadie.'
                : 'Ha pasado un tiempo desde tu último respaldo. Un buen momento para guardar uno nuevo.'}
            </p>
            <button
              onClick={onOpenData}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-600"
            >
              Respaldar
            </button>
            <button
              onClick={() => setBackupNudgeDismissed(true)}
              className="text-lg leading-none text-sky-400 transition hover:text-sky-600"
              title="Ahora no"
            >
              ×
            </button>
          </div>
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
                born={slot.id === bornId}
                atRisk={isAtRisk(slot, today)}
                // Escalada del at-risk por días de inactividad (§5): 'soft' 14-17,
                // 'strong' 18-20 (más cerca del abandono a los 21).
                risk={riskLevel(daysInactive(slot, today))}
                // Solo el personaje en riesgo trae su línea corta en el Home (spec §5);
                // Cupido NO aparece en el idle del Home.
                riskLine={
                  isAtRisk(slot, today)
                    ? reactionFor(slot, state.missions, today, { variantIndex: 0 }).characterLine
                    : null
                }
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
          <button
            onClick={onOpenData}
            className="ml-auto text-xl opacity-60 transition hover:opacity-100"
            title="Respaldo de datos"
          >
            💾
          </button>
        </nav>
      </footer>
    </div>
  );
}

function CharacterCard({
  character,
  born,
  atRisk,
  risk,
  riskLine,
  onOpen,
  onCreateMission,
}: {
  character: Character;
  // Recién creado: aterriza con scale(0.85->1)+opacity (card-born) y un latido único sobre
  // el sprite (happy-pop). "Nació alguien", no "se agregó una fila" (§3 "Crear personaje").
  born: boolean;
  atRisk: boolean;
  risk: RiskLevel;
  riskLine: string | null;
  onOpen: () => void;
  onCreateMission: () => void;
}) {
  // El borde vira a naranja (token --color-risk) en riesgo, y al naranja intenso
  // (--color-risk-strong) en días 18-20. El borde RESPIRA con un glow naranja lento
  // (risk-breathe) — "te extraño", no alarma. Naranja, nunca rojo (§5).
  const borderClass =
    risk === 'strong'
      ? 'border-risk-strong animate-risk-breathe-strong'
      : risk === 'soft'
        ? 'border-risk animate-risk-breathe'
        : 'border-border';

  // El aterrizaje corre una vez al montar (CSS animation, no transition): la card solo se
  // monta con esta clase si nació justo ahora. prefers-reduced-motion lo colapsa (guard CSS).
  const bornClass = born ? 'animate-card-born' : '';

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-card border-2 bg-surface p-4 ${borderClass} ${bornClass}`}
    >
      <button onClick={onOpen} className="flex flex-col items-center gap-2">
        {/* En riesgo: grayscale triste + suspiro idle lento (NO shake). Al nacer: latido único
            sobre el sprite (happy-pop). El at-risk de un recién nacido no aplica en la práctica. */}
        <span className={born ? 'animate-happy-pop inline-block' : 'inline-block'}>
          {/* Respiración idle solo en reposo normal: NO si está en riesgo (suspira) ni si
              acaba de nacer (el happy-pop del wrapper está corriendo). §6 + §2 principio 3. */}
          <Sprite
            character={character}
            size={80}
            sad={atRisk}
            sigh={atRisk}
            idle={!atRisk && !born}
          />
        </span>
        <span className="font-semibold text-ink">{character.name}</span>
        <span className="text-xs text-ink-soft">Nivel {character.level}</span>
      </button>
      {character.level === 3 && (
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          ✓ Consolidado
        </span>
      )}
      {atRisk && (
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            risk === 'strong' ? 'bg-orange-100 text-risk-strong' : 'bg-orange-100 text-orange-700'
          }`}
        >
          ⚠ Necesita atención
        </span>
      )}
      {riskLine && (
        <p className="px-1 text-center text-xs italic leading-snug text-stone-500">“{riskLine}”</p>
      )}
      <div className="w-full">
        <HeartsBar character={character} atRisk={atRisk} />
      </div>
      <button
        onClick={onCreateMission}
        className="mt-1 w-full rounded-card bg-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-press"
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
