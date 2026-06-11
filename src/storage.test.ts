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
  return state;
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
