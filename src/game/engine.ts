// Motor del juego: funciones puras sobre GameState. Ninguna toca localStorage ni el reloj;
// la fecha "hoy" siempre llega como parámetro (ISO YYYY-MM-DD) para poder testear.
// Reglas: docs/design/mecanicas-detalle.md, docs/build/bubble-decisions.md, docs/testing/qa-report.md.
//
// Decisiones de Hector (2026-06-11):
// - heartsTotal es el único contador y BAJA con penalizaciones (mínimo 0). El nivel no baja
//   por penalizaciones — solo por abandono.
// - El reloj de abandono nunca para: cada 21 días completos de inactividad baja un nivel;
//   en nivel 0 el personaje se va. Varias bajadas pueden acumularse en un solo check.

import type {
  Character,
  Difficulty,
  GameState,
  HappyEnding,
  Level,
  Mission,
  SlotNumber,
} from '../types';
import {
  ABANDONMENT_DAYS,
  AT_RISK_DAYS,
  CANCEL_PENALTY,
  LEVEL_THRESHOLDS,
  MAX_LEVEL,
  MAX_PENDING_MISSIONS_PER_CHARACTER,
  SLOT_NUMBERS,
} from './constants';
import { addDays, daysBetween } from './dates';
import { calcHeartsEarned } from './hearts';

function newId(): string {
  return crypto.randomUUID();
}

// --- Consultas ---

export function activeCharacters(state: GameState): Character[] {
  return state.characters.filter((c) => c.status === 'active');
}

export function pendingMissions(state: GameState, characterId: string): Mission[] {
  return state.missions.filter((m) => m.characterId === characterId && m.status === 'pending');
}

export function freeSlots(state: GameState): SlotNumber[] {
  const occupied = new Set(activeCharacters(state).map((c) => c.slotNumber));
  return SLOT_NUMBERS.filter((slot) => !occupied.has(slot));
}

export function daysInactive(character: Character, today: string): number {
  return Math.max(0, daysBetween(character.inactivitySince, today));
}

export function completedMissionsCount(state: GameState, characterId: string): number {
  return state.missions.filter((m) => m.characterId === characterId && m.status === 'completed').length;
}

export function daysTogether(character: Character, today: string): number {
  return Math.max(0, daysBetween(character.createdDate, today));
}

// Estado de riesgo (14-20 días sin actividad) — solo visual, ver mecanicas-detalle §7.
export function isAtRisk(character: Character, today: string): boolean {
  if (character.status !== 'active') return false;
  const days = daysInactive(character, today);
  return days >= AT_RISK_DAYS && days < ABANDONMENT_DAYS;
}

// --- Helpers internos ---

function patchCharacter(state: GameState, id: string, patch: Partial<Character>): GameState {
  return {
    ...state,
    characters: state.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  };
}

function patchMission(state: GameState, id: string, patch: Partial<Mission>): GameState {
  return {
    ...state,
    missions: state.missions.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  };
}

function getCharacter(state: GameState, id: string): Character | undefined {
  return state.characters.find((c) => c.id === id);
}

// Penalización compartida por cancelación manual y vencimiento: heartsTotal baja
// (clamp a 0, mecanicas-detalle §3 — sin "deuda"), el nivel NO baja, y se agenda
// la escena de cancelación.
function applyPenalty(state: GameState, characterId: string, penalty: number): GameState {
  const character = getCharacter(state, characterId);
  if (!character) return state;
  return patchCharacter(state, characterId, {
    heartsTotal: Math.max(0, character.heartsTotal - penalty),
    pendingCancellationScene: true,
  });
}

// --- Acciones ---

export type CreateCharacterResult =
  | { ok: true; state: GameState; character: Character }
  | { ok: false; error: 'no_free_slot' };

export function createCharacter(state: GameState, name: string, today: string): CreateCharacterResult {
  const slot = freeSlots(state)[0];
  if (slot === undefined) return { ok: false, error: 'no_free_slot' };
  const character: Character = {
    id: newId(),
    name,
    slotNumber: slot,
    status: 'active',
    level: 0,
    heartsTotal: 0,
    createdDate: today,
    lastMissionCompletedDate: null,
    inactivitySince: today,
    pendingAbandonmentScene: false,
    pendingCancellationScene: false,
  };
  return { ok: true, state: { ...state, characters: [...state.characters, character] }, character };
}

export type CreateMissionError = 'character_not_found' | 'character_not_active' | 'pending_limit_reached';

export type CreateMissionResult =
  | { ok: true; state: GameState; mission: Mission }
  | { ok: false; error: CreateMissionError };

export function createMission(
  state: GameState,
  characterId: string,
  name: string,
  difficulty: Difficulty,
  deadline: string,
): CreateMissionResult {
  const character = getCharacter(state, characterId);
  if (!character) return { ok: false, error: 'character_not_found' };
  if (character.status !== 'active') return { ok: false, error: 'character_not_active' };
  if (pendingMissions(state, characterId).length >= MAX_PENDING_MISSIONS_PER_CHARACTER) {
    return { ok: false, error: 'pending_limit_reached' };
  }
  const mission: Mission = {
    id: newId(),
    characterId,
    name,
    difficulty,
    deadline,
    status: 'pending',
    completedDate: null,
    heartsAwarded: null,
  };
  return { ok: true, state: { ...state, missions: [...state.missions, mission] }, mission };
}

export type CompleteMissionResult =
  | {
      kind: 'completed';
      state: GameState;
      heartsEarned: number;
      leveledUp: boolean;
      newLevel: Level;
      wedding: boolean;
    }
  // Misión vencida: no se puede completar — se marca failed y se aplica la penalización (TC-024/TC-040).
  | { kind: 'expired'; state: GameState; penalty: number }
  | { kind: 'invalid'; error: 'mission_not_found' | 'mission_not_pending' };

export function completeMission(state: GameState, missionId: string, today: string): CompleteMissionResult {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission) return { kind: 'invalid', error: 'mission_not_found' };
  if (mission.status !== 'pending') return { kind: 'invalid', error: 'mission_not_pending' };

  if (daysBetween(mission.deadline, today) > 0) {
    return { kind: 'expired', state: failMission(state, mission), penalty: CANCEL_PENALTY[mission.difficulty] };
  }

  const heartsEarned = calcHeartsEarned(mission.difficulty, mission.deadline, today);
  let next = patchMission(state, mission.id, {
    status: 'completed',
    completedDate: today,
    heartsAwarded: heartsEarned,
  });

  const character = getCharacter(next, mission.characterId);
  if (!character) return { kind: 'invalid', error: 'mission_not_found' };

  const heartsTotal = character.heartsTotal + heartsEarned;
  let level = character.level;
  let leveledUp = false;
  // Sube de a un nivel por misión, aunque heartsTotal cruce más de un umbral (TC-012).
  if (level < MAX_LEVEL && heartsTotal >= LEVEL_THRESHOLDS[level + 1]) {
    level = (level + 1) as Level;
    leveledUp = true;
  }

  next = patchCharacter(next, character.id, {
    heartsTotal,
    lastMissionCompletedDate: today,
    inactivitySince: today,
    level,
  });

  const wedding = leveledUp && level === MAX_LEVEL;
  if (wedding) next = applyWedding(next, character.id, today);

  return { kind: 'completed', state: next, heartsEarned, leveledUp, newLevel: level, wedding };
}

// Nivel 3 alcanzado: boda, archivo en HappyEnding y liberación del slot (bubble-decisions Workflow 4).
function applyWedding(state: GameState, characterId: string, today: string): GameState {
  const character = getCharacter(state, characterId);
  if (!character) return state;

  let next = patchCharacter(state, characterId, { status: 'happy_ending', slotNumber: null });
  // Las misiones pendientes restantes se cierran sin penalización (TC-029).
  next = {
    ...next,
    missions: next.missions.map((m) =>
      m.characterId === characterId && m.status === 'pending' ? { ...m, status: 'cancelled' as const } : m,
    ),
  };
  const happyEnding: HappyEnding = {
    id: newId(),
    characterName: character.name,
    originalCharacterId: characterId,
    weddingDate: today,
  };
  return { ...next, happyEndings: [...next.happyEndings, happyEnding] };
}

export type CancelMissionResult =
  | { ok: true; state: GameState; penalty: number }
  | { ok: false; error: 'mission_not_found' | 'mission_not_pending' };

export function cancelMission(state: GameState, missionId: string): CancelMissionResult {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission) return { ok: false, error: 'mission_not_found' };
  if (mission.status !== 'pending') return { ok: false, error: 'mission_not_pending' };

  const penalty = CANCEL_PENALTY[mission.difficulty];
  let next = patchMission(state, mission.id, { status: 'cancelled', heartsAwarded: -penalty });
  next = applyPenalty(next, mission.characterId, penalty);
  return { ok: true, state: next, penalty };
}

export type DeleteMissionResult =
  | { ok: true; state: GameState }
  | { ok: false; error: 'mission_not_found' | 'mission_not_pending' };

// Borrar/archivar una misión pendiente que el usuario ya no quiere. A diferencia de
// cancelar, no aplica penalización de corazones, no agenda escena de cancelación y no
// toca al personaje. La misión simplemente desaparece (decisión de Hector, 2026-06-11,
// ver mecanicas-detalle §10).
export function deleteMission(state: GameState, missionId: string): DeleteMissionResult {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission) return { ok: false, error: 'mission_not_found' };
  if (mission.status !== 'pending') return { ok: false, error: 'mission_not_pending' };

  return { ok: true, state: { ...state, missions: state.missions.filter((m) => m.id !== missionId) } };
}

export type RescheduleMissionResult =
  | { ok: true; state: GameState; penalty: number; newMission: Mission }
  | { ok: false; error: 'mission_not_found' | 'mission_not_pending' };

// Cambiar la fecha límite = cancelar la misión original (con penalización) y crear una
// nueva con la fecha nueva (TC-023, bubble-decisions Workflow 6).
export function rescheduleMission(
  state: GameState,
  missionId: string,
  newDeadline: string,
): RescheduleMissionResult {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission) return { ok: false, error: 'mission_not_found' };

  const cancelled = cancelMission(state, missionId);
  if (!cancelled.ok) return cancelled;

  const created = createMission(cancelled.state, mission.characterId, mission.name, mission.difficulty, newDeadline);
  // Al cancelar se liberó un slot de pendientes, así que crear no puede fallar por límite.
  if (!created.ok) return { ok: false, error: 'mission_not_found' };

  return { ok: true, state: created.state, penalty: cancelled.penalty, newMission: created.mission };
}

function failMission(state: GameState, mission: Mission): GameState {
  const penalty = CANCEL_PENALTY[mission.difficulty];
  const next = patchMission(state, mission.id, { status: 'failed', heartsAwarded: -penalty });
  return applyPenalty(next, mission.characterId, penalty);
}

export interface ExpiredMissionsResult {
  state: GameState;
  expiredMissionIds: string[];
}

// Check al abrir la app: misiones pendientes con deadline anterior a hoy pasan a failed
// con penalización (bubble-decisions Workflow 3). El día del deadline todavía es válido (TC-039).
export function checkExpiredMissions(state: GameState, today: string): ExpiredMissionsResult {
  let next = state;
  const expiredMissionIds: string[] = [];
  for (const mission of state.missions) {
    if (mission.status !== 'pending' || daysBetween(mission.deadline, today) <= 0) continue;
    const current = next.missions.find((m) => m.id === mission.id);
    if (!current) continue;
    next = failMission(next, current);
    expiredMissionIds.push(mission.id);
  }
  return { state: next, expiredMissionIds };
}

// Las escenas se muestran una sola vez: la UI llama esto al cerrar la escena
// (botón "Cerrar este capítulo" / "Entendido") para limpiar el flag.

export function acknowledgeAbandonmentScene(state: GameState, characterId: string): GameState {
  return patchCharacter(state, characterId, { pendingAbandonmentScene: false });
}

export function acknowledgeCancellationScene(state: GameState, characterId: string): GameState {
  return patchCharacter(state, characterId, { pendingCancellationScene: false });
}

export interface AbandonmentEvent {
  characterId: string;
  previousLevel: Level;
  newLevel: Level;
  slotFreed: boolean;
}

export interface AbandonmentResult {
  state: GameState;
  events: AbandonmentEvent[];
}

// Check al abrir la app (bubble-decisions Workflow 2/5). El reloj nunca para: por cada
// 21 días completos desde inactivitySince se aplica una bajada de nivel; en nivel 0 el
// personaje se va (status abandoned, slot liberado, pendientes a failed sin penalización
// extra). El ancla avanza 21 días por bajada aplicada, así el check es idempotente y las
// bajadas se acumulan si el usuario vuelve después de mucho tiempo.
// heartsTotal nunca cambia por abandono (TC-017/TC-042).
export function checkAbandonment(state: GameState, today: string): AbandonmentResult {
  let next = state;
  const events: AbandonmentEvent[] = [];
  for (const character of state.characters) {
    if (character.status !== 'active') continue;
    const periods = Math.floor(daysInactive(character, today) / ABANDONMENT_DAYS);
    if (periods <= 0) continue;

    let level = character.level;
    let abandoned = false;
    let periodsApplied = 0;
    for (let i = 0; i < periods; i++) {
      periodsApplied++;
      if (level > 0) {
        level = (level - 1) as Level;
      } else {
        abandoned = true;
        break;
      }
    }

    if (abandoned) {
      next = patchCharacter(next, character.id, {
        level,
        status: 'abandoned',
        slotNumber: null,
        pendingAbandonmentScene: true,
      });
      next = {
        ...next,
        missions: next.missions.map((m) =>
          m.characterId === character.id && m.status === 'pending' ? { ...m, status: 'failed' as const } : m,
        ),
      };
    } else {
      next = patchCharacter(next, character.id, {
        level,
        pendingAbandonmentScene: true,
        inactivitySince: addDays(character.inactivitySince, periodsApplied * ABANDONMENT_DAYS),
      });
    }
    events.push({ characterId: character.id, previousLevel: character.level, newLevel: level, slotFreed: abandoned });
  }
  return { state: next, events };
}
