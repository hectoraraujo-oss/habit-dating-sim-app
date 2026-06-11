// Persistencia: un solo objeto JSON en localStorage con versión de schema,
// más export/import como texto JSON para respaldo manual.
// El parámetro `storage` es inyectable para poder testear sin navegador.

import type { GameState } from './types';
import { SCHEMA_VERSION } from './game/constants';

export const STORAGE_KEY = 'habit-dating-sim:state';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function defaultStorage(): StorageLike {
  return globalThis.localStorage;
}

export function createEmptyState(): GameState {
  return {
    schemaVersion: SCHEMA_VERSION,
    characters: [],
    missions: [],
    happyEndings: [],
  };
}

function isValidState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Partial<GameState>;
  return (
    state.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(state.characters) &&
    Array.isArray(state.missions) &&
    Array.isArray(state.happyEndings)
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
    return isValidState(parsed) ? parsed : createEmptyState();
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
  return { ok: true, state: parsed };
}
