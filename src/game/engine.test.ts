// Tests de los helpers del motor usados por la UI (no cubiertos por el QA report).

import { describe, expect, it } from 'vitest';
import type { Character, GameState, Mission } from '../types';
import { SCHEMA_VERSION } from './constants';
import { addDays } from './dates';
import {
  acknowledgeAbandonmentScene,
  acknowledgeCancellationScene,
  checkAbandonment,
  completedMissionsCount,
  createCharacter,
  daysTogether,
  deleteCharacter,
  freeSlots,
  isAtRisk,
} from './engine';

const TODAY = '2026-06-11';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const createdDate = overrides.createdDate ?? addDays(TODAY, -30);
  const lastMissionCompletedDate = overrides.lastMissionCompletedDate ?? null;
  return {
    id: 'char-1',
    name: 'Gym',
    slotNumber: 1,
    status: 'active',
    level: 0,
    heartsTotal: 0,
    createdDate,
    lastMissionCompletedDate,
    inactivitySince: lastMissionCompletedDate ?? createdDate,
    pendingAbandonmentScene: false,
    pendingCancellationScene: false,
    ...overrides,
  };
}

function makeMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-1',
    characterId: 'char-1',
    name: 'Ir al gym',
    difficulty: 'easy',
    deadline: addDays(TODAY, 7),
    status: 'pending',
    completedDate: null,
    heartsAwarded: null,
    ...overrides,
  };
}

function makeState(characters: Character[] = [], missions: Mission[] = []): GameState {
  return { schemaVersion: SCHEMA_VERSION, onboarded: true, characters, missions, happyEndings: [] };
}

describe('acknowledge de escenas', () => {
  it('cerrar la escena de abandono limpia el flag y no se repite', () => {
    const state = makeState([
      makeCharacter({ level: 1, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const checked = checkAbandonment(state, TODAY);
    expect(checked.state.characters[0].pendingAbandonmentScene).toBe(true);
    const acked = acknowledgeAbandonmentScene(checked.state, 'char-1');
    expect(acked.characters[0].pendingAbandonmentScene).toBe(false);
    // Mismo día, mismo estado: no vuelve a disparar (el ancla ya avanzó)
    expect(checkAbandonment(acked, TODAY).events).toHaveLength(0);
  });

  it('cerrar la escena de cancelación limpia el flag', () => {
    const state = makeState([makeCharacter({ pendingCancellationScene: true })]);
    const acked = acknowledgeCancellationScene(state, 'char-1');
    expect(acked.characters[0].pendingCancellationScene).toBe(false);
  });
});

describe('estadísticas para pantallas', () => {
  it('completedMissionsCount cuenta solo las completadas del personaje', () => {
    const state = makeState(
      [makeCharacter()],
      [
        makeMission({ id: 'm1', status: 'completed', completedDate: TODAY, heartsAwarded: 5 }),
        makeMission({ id: 'm2', status: 'completed', completedDate: TODAY, heartsAwarded: 10 }),
        makeMission({ id: 'm3', status: 'cancelled', heartsAwarded: -3 }),
        makeMission({ id: 'm4', status: 'pending' }),
        makeMission({ id: 'm5', characterId: 'char-2', status: 'completed', completedDate: TODAY }),
      ],
    );
    expect(completedMissionsCount(state, 'char-1')).toBe(2);
  });

  it('daysTogether cuenta desde la fecha de creación', () => {
    expect(daysTogether(makeCharacter({ createdDate: addDays(TODAY, -30) }), TODAY)).toBe(30);
  });

  it('isAtRisk marca el rango 14-20 días de inactividad', () => {
    expect(isAtRisk(makeCharacter({ lastMissionCompletedDate: addDays(TODAY, -13) }), TODAY)).toBe(false);
    expect(isAtRisk(makeCharacter({ lastMissionCompletedDate: addDays(TODAY, -14) }), TODAY)).toBe(true);
    expect(isAtRisk(makeCharacter({ lastMissionCompletedDate: addDays(TODAY, -20) }), TODAY)).toBe(true);
    expect(isAtRisk(makeCharacter({ lastMissionCompletedDate: addDays(TODAY, -21) }), TODAY)).toBe(false);
  });
});

describe('deleteCharacter', () => {
  it('elimina al personaje y todas sus misiones, sin tocar las de otros personajes', () => {
    const state = makeState(
      [makeCharacter({ id: 'char-1' }), makeCharacter({ id: 'char-2', name: 'Lectura', slotNumber: 2 })],
      [
        makeMission({ id: 'm1', characterId: 'char-1', status: 'pending' }),
        makeMission({ id: 'm2', characterId: 'char-1', status: 'completed', completedDate: TODAY, heartsAwarded: 5 }),
        makeMission({ id: 'm3', characterId: 'char-2', status: 'pending' }),
      ],
    );
    const result = deleteCharacter(state, 'char-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.characters.map((c) => c.id)).toEqual(['char-2']);
    expect(result.state.missions.map((m) => m.id)).toEqual(['m3']);
  });

  it('libera el slot para crear un personaje nuevo', () => {
    const state = makeState([makeCharacter({ slotNumber: 1 })]);
    expect(freeSlots(state)).toEqual([2, 3]);

    const result = deleteCharacter(state, 'char-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(freeSlots(result.state)).toEqual([1, 2, 3]);

    const created = createCharacter(result.state, 'Nuevo hábito', TODAY);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.character.slotNumber).toBe(1);
  });

  it('devuelve error si el personaje no existe', () => {
    const state = makeState([makeCharacter()]);
    expect(deleteCharacter(state, 'no-existe')).toEqual({ ok: false, error: 'character_not_found' });
  });
});
