// Tests de la capa de persistencia (localStorage inyectado como stub en memoria).

import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from './game/constants';
import {
  STORAGE_KEY,
  createEmptyState,
  exportStateJson,
  importStateJson,
  loadState,
  saveState,
} from './storage';
import type { GameState } from './types';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

function sampleState(): GameState {
  const state = createEmptyState();
  // Un respaldo de un usuario con partida: ya pasó el onboarding.
  state.onboarded = true;
  state.characters.push({
    id: 'char-1',
    name: 'Gym',
    slotNumber: 1,
    status: 'active',
    level: 1,
    heartsTotal: 25,
    createdDate: '2026-05-01',
    lastMissionCompletedDate: '2026-06-10',
    inactivitySince: '2026-06-10',
    pendingAbandonmentScene: false,
    pendingCancellationScene: false,
  });
  state.missions.push({
    id: 'mission-1',
    characterId: 'char-1',
    name: 'Ir al gym',
    difficulty: 'medium',
    deadline: '2026-06-15',
    status: 'pending',
    completedDate: null,
    heartsAwarded: null,
  });
  state.happyEndings.push({
    id: 'he-1',
    characterName: 'Lectura',
    originalCharacterId: 'char-0',
    weddingDate: '2026-04-20',
  });
  return state;
}

// Respaldo corrupto representativo: parte del estado válido y rompe un campo interno.
function corruptState(patch: {
  character?: Record<string, unknown>;
  mission?: Record<string, unknown>;
  dropCharacterField?: string;
  dropMissionField?: string;
}): string {
  const state = sampleState();
  const character: Record<string, unknown> = { ...state.characters[0], ...patch.character };
  const mission: Record<string, unknown> = { ...state.missions[0], ...patch.mission };
  if (patch.dropCharacterField) delete character[patch.dropCharacterField];
  if (patch.dropMissionField) delete mission[patch.dropMissionField];
  return JSON.stringify({ ...state, characters: [character], missions: [mission] });
}

describe('saveState / loadState', () => {
  it('guarda y recupera el estado completo (roundtrip)', () => {
    const storage = memoryStorage();
    const state = sampleState();
    saveState(state, storage);
    expect(loadState(storage)).toEqual(state);
  });

  it('guarda bajo una sola clave de localStorage', () => {
    const storage = memoryStorage();
    saveState(createEmptyState(), storage);
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('devuelve estado vacío si no hay nada guardado', () => {
    expect(loadState(memoryStorage())).toEqual(createEmptyState());
  });

  it('devuelve estado vacío si el JSON guardado está corrupto', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{esto no es json');
    expect(loadState(storage)).toEqual(createEmptyState());
  });

  it('devuelve estado vacío si la versión de schema no coincide', () => {
    const storage = memoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...createEmptyState(), schemaVersion: SCHEMA_VERSION + 1 }),
    );
    expect(loadState(storage)).toEqual(createEmptyState());
  });
});

describe('exportStateJson / importStateJson', () => {
  it('exporta e importa el estado sin pérdida (roundtrip)', () => {
    const state = sampleState();
    const result = importStateJson(exportStateJson(state));
    expect(result).toEqual({ ok: true, state });
  });

  it('rechaza JSON inválido', () => {
    expect(importStateJson('no es json')).toEqual({ ok: false, error: 'invalid_json' });
  });

  it('rechaza un objeto con schema desconocido', () => {
    expect(importStateJson('{"foo": 1}')).toEqual({ ok: false, error: 'invalid_schema' });
    expect(
      importStateJson(JSON.stringify({ ...createEmptyState(), schemaVersion: 99 })),
    ).toEqual({ ok: false, error: 'invalid_schema' });
  });
});

// QA C1: un respaldo con campos internos corruptos no debe pasar la validación.
// Antes, isValidState solo revisaba schemaVersion + que los 3 campos fueran arrays:
// un character con inactivitySince no parseable se persistía y brickeaba la app
// en la siguiente apertura (RangeError dentro de initGame).
describe('importStateJson — respaldos corruptos (QA C1)', () => {
  it('acepta un respaldo completo y válido (character + mission + happyEnding)', () => {
    const state = sampleState();
    expect(importStateJson(exportStateJson(state))).toEqual({ ok: true, state });
  });

  it('rechaza un character con fecha no parseable (inactivitySince: "ayer")', () => {
    expect(importStateJson(corruptState({ character: { inactivitySince: 'ayer' } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza un character sin heartsTotal', () => {
    expect(importStateJson(corruptState({ dropCharacterField: 'heartsTotal' }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza un character con heartsTotal de tipo incorrecto (string)', () => {
    expect(importStateJson(corruptState({ character: { heartsTotal: '20' } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza un character con status inventado', () => {
    expect(importStateJson(corruptState({ character: { status: 'zombie' } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza un character con level fuera de rango', () => {
    expect(importStateJson(corruptState({ character: { level: 7 } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza un character con slotNumber inválido (debe ser 1-3 o null)', () => {
    expect(importStateJson(corruptState({ character: { slotNumber: 9 } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza un character con flag de escena no booleano', () => {
    expect(
      importStateJson(corruptState({ character: { pendingCancellationScene: 'true' } })),
    ).toEqual({ ok: false, error: 'invalid_schema' });
  });

  it('rechaza characters: [null]', () => {
    const state = sampleState();
    expect(importStateJson(JSON.stringify({ ...state, characters: [null] }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza una mission sin deadline', () => {
    expect(importStateJson(corruptState({ dropMissionField: 'deadline' }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza una mission con deadline no ISO', () => {
    expect(importStateJson(corruptState({ mission: { deadline: '15/06/2026' } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza una mission con difficulty inventada', () => {
    expect(importStateJson(corruptState({ mission: { difficulty: 'imposible' } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza una mission con status inventado', () => {
    expect(importStateJson(corruptState({ mission: { status: 'paused' } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza una fecha con formato ISO pero imposible (2026-02-31)', () => {
    expect(importStateJson(corruptState({ character: { createdDate: '2026-02-31' } }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('rechaza un happyEnding sin weddingDate', () => {
    const state = sampleState();
    const broken = { ...state.happyEndings[0] } as Record<string, unknown>;
    delete broken.weddingDate;
    expect(importStateJson(JSON.stringify({ ...state, happyEndings: [broken] }))).toEqual({
      ok: false,
      error: 'invalid_schema',
    });
  });

  it('loadState cae a estado vacío si lo guardado tiene un character corrupto', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, corruptState({ character: { inactivitySince: 'ayer' } }));
    expect(loadState(storage)).toEqual(createEmptyState());
  });
});

// Onboarding: campo `onboarded` (migración suave, sin subir SCHEMA_VERSION).
// Regla de producto: ausente o no booleano = ya onboarded (true). Solo el `false`
// explícito de createEmptyState entra al onboarding.
describe('onboarded — campo nuevo y migración suave', () => {
  it('createEmptyState nace con onboarded: false', () => {
    expect(createEmptyState().onboarded).toBe(false);
  });

  it('un respaldo viejo SIN onboarded se carga como onboarded: true (no re-onboardea)', () => {
    const storage = memoryStorage();
    const legacy = sampleState() as unknown as Record<string, unknown>;
    delete legacy.onboarded; // simula un respaldo anterior a esta feature
    storage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    expect(loadState(storage).onboarded).toBe(true);
  });

  it('importStateJson de un respaldo viejo SIN onboarded lo normaliza a true', () => {
    const legacy = sampleState() as unknown as Record<string, unknown>;
    delete legacy.onboarded;
    const result = importStateJson(JSON.stringify(legacy));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state.onboarded).toBe(true);
  });

  it('un respaldo con onboarded: false explícito conserva false al cargar', () => {
    const storage = memoryStorage();
    saveState({ ...sampleState(), onboarded: false }, storage);
    expect(loadState(storage).onboarded).toBe(false);
  });

  it('un respaldo con basura en onboarded se normaliza a true (seguro)', () => {
    const storage = memoryStorage();
    const garbage = { ...sampleState(), onboarded: 'sí' } as unknown as GameState;
    saveState(garbage, storage);
    expect(loadState(storage).onboarded).toBe(true);
  });

  it('roundtrip de un estado onboarded: false lo conserva (export/import)', () => {
    const empty = createEmptyState();
    const result = importStateJson(exportStateJson(empty));
    expect(result).toEqual({ ok: true, state: empty });
  });
});
