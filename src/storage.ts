// Persistencia: un solo objeto JSON en localStorage con versión de schema,
// más export/import como texto JSON para respaldo manual.
// El parámetro `storage` es inyectable para poder testear sin navegador.

import type { Character, GameState, HappyEnding, Mission } from './types';
import { SCHEMA_VERSION } from './game/constants';

export const STORAGE_KEY = 'habit-dating-sim:state';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function defaultStorage(): StorageLike {
  return globalThis.localStorage;
}

export function createEmptyState(): GameState {
  return {
    schemaVersion: SCHEMA_VERSION,
    // Una partida nueva nace SIN onboardear: arranca en la pantalla de inicio.
    onboarded: false,
    characters: [],
    missions: [],
    happyEndings: [],
  };
}

// Migración suave del campo `onboarded` (no se subió SCHEMA_VERSION para no invalidar
// respaldos viejos). Regla de producto: ausente o no booleano = ya onboarded (true).
// Solo un `false` explícito (el que escribe createEmptyState) entra al onboarding. Así un
// respaldo anterior a esta feature, que por definición es de un usuario existente, nunca
// re-onboardea. Se aplica en la frontera de lectura (loadState / importStateJson), DESPUÉS
// de validar, para no acoplar isValidState (y su contrato C1) a este campo.
function normalizeLoaded(state: GameState): GameState {
  return {
    ...state,
    onboarded: state.onboarded === false ? false : true,
    // A1 (motor de reactividad, P8-a): respaldos viejos no tienen milestonesShown. Se
    // inyecta [] al leer, igual que onboarded — sin subir SCHEMA_VERSION. Si el campo ya
    // viene como array (de strings, garantizado por isValidCharacter) se conserva tal cual.
    characters: state.characters.map((c) =>
      Array.isArray(c.milestonesShown) ? c : { ...c, milestonesShown: [] },
    ),
  };
}

// --- Validación profunda (QA C1) ---
// Un respaldo con campos internos corruptos (fecha no parseable, número como string,
// status inventado…) pasaba la validación, se persistía, y brickeaba la app en la
// siguiente apertura (RangeError en los checks de initGame). Aquí se valida la forma
// y el tipo de cada character/mission/happyEnding antes de aceptar el estado.

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Fecha ISO YYYY-MM-DD real: formato correcto Y existente en el calendario
// (rechaza "ayer", "15/06/2026" y también "2026-02-31").
function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

const CHARACTER_STATUSES: readonly string[] = ['active', 'happy_ending', 'abandoned'];
const MISSION_STATUSES: readonly string[] = ['pending', 'completed', 'failed', 'cancelled'];
const DIFFICULTIES: readonly string[] = ['easy', 'medium', 'hard'];
const LEVELS: readonly number[] = [0, 1, 2, 3];
const SLOT_NUMBERS: readonly number[] = [1, 2, 3];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidCharacter(value: unknown): value is Character {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    (value.slotNumber === null ||
      (isFiniteNumber(value.slotNumber) && SLOT_NUMBERS.includes(value.slotNumber))) &&
    typeof value.status === 'string' &&
    CHARACTER_STATUSES.includes(value.status) &&
    isFiniteNumber(value.level) &&
    LEVELS.includes(value.level) &&
    isFiniteNumber(value.heartsTotal) &&
    isIsoDate(value.createdDate) &&
    (value.lastMissionCompletedDate === null || isIsoDate(value.lastMissionCompletedDate)) &&
    isIsoDate(value.inactivitySince) &&
    typeof value.pendingAbandonmentScene === 'boolean' &&
    typeof value.pendingCancellationScene === 'boolean' &&
    // A1 (P8-a): milestonesShown es opcional para no rechazar respaldos viejos (igual que
    // onboarded: la migración suave lo inyecta al leer). PERO si está presente debe ser un
    // array de strings; un tipo inválido SÍ rechaza el respaldo (coherente con C1).
    isMilestonesShown(value.milestonesShown)
  );
}

// Ausente (respaldo viejo) = válido; presente debe ser string[]. Cualquier otra cosa rechaza.
function isMilestonesShown(value: unknown): boolean {
  if (value === undefined) return true;
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function isValidMission(value: unknown): value is Mission {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.characterId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.difficulty === 'string' &&
    DIFFICULTIES.includes(value.difficulty) &&
    isIsoDate(value.deadline) &&
    typeof value.status === 'string' &&
    MISSION_STATUSES.includes(value.status) &&
    (value.completedDate === null || isIsoDate(value.completedDate)) &&
    (value.heartsAwarded === null || isFiniteNumber(value.heartsAwarded))
  );
}

function isValidHappyEnding(value: unknown): value is HappyEnding {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.characterName === 'string' &&
    typeof value.originalCharacterId === 'string' &&
    isIsoDate(value.weddingDate)
  );
}

function isValidState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  const state = value as Partial<GameState>;
  return (
    state.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(state.characters) &&
    state.characters.every(isValidCharacter) &&
    Array.isArray(state.missions) &&
    state.missions.every(isValidMission) &&
    Array.isArray(state.happyEndings) &&
    state.happyEndings.every(isValidHappyEnding)
  );
}

export function saveState(state: GameState, storage: StorageLike = defaultStorage()): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Si no hay nada guardado, o el JSON está corrupto, o el schema no coincide,
// arranca con estado vacío en lugar de romper la app.
export function loadState(storage: StorageLike = defaultStorage()): GameState {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return createEmptyState();
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidState(parsed) ? normalizeLoaded(parsed) : createEmptyState();
  } catch {
    return createEmptyState();
  }
}

export function exportStateJson(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export type ImportResult =
  | { ok: true; state: GameState }
  | { ok: false; error: 'invalid_json' | 'invalid_schema' };

export function importStateJson(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'invalid_json' };
  }
  if (!isValidState(parsed)) return { ok: false, error: 'invalid_schema' };
  return { ok: true, state: normalizeLoaded(parsed) };
}
