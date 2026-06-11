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
  createMission,
  daysTogether,
  deleteMission,
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
  return { schemaVersion: SCHEMA_VERSION, characters, missions, happyEndings: [] };
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

describe('deleteMission', () => {
  it('borra una misión pendiente sin penalizar ni tocar al personaje', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 10 })],
      [makeMission({ id: 'mission-1', status: 'pending' })],
    );
    const result = deleteMission(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.missions).toHaveLength(0);
    expect(result.state.characters[0].heartsTotal).toBe(10);
    expect(result.state.characters[0].pendingCancellationScene).toBe(false);
  });

  it('libera un slot de misiones pendientes para crear una nueva', () => {
    const character = makeCharacter();
    const missions = [
      makeMission({ id: 'm1', deadline: addDays(TODAY, 3) }),
      makeMission({ id: 'm2', deadline: addDays(TODAY, 4) }),
      makeMission({ id: 'm3', deadline: addDays(TODAY, 5) }),
    ];
    let state = makeState([character], missions);
    expect(createMission(state, 'char-1', 'Otra', 'easy', addDays(TODAY, 6)).ok).toBe(false);

    const deleted = deleteMission(state, 'm1');
    expect(deleted.ok).toBe(true);
    if (!deleted.ok) return;
    state = deleted.state;
    expect(createMission(state, 'char-1', 'Otra', 'easy', addDays(TODAY, 6)).ok).toBe(true);
  });

  it('no borra una misión que no existe', () => {
    const state = makeState([makeCharacter()], []);
    expect(deleteMission(state, 'no-existe')).toEqual({ ok: false, error: 'mission_not_found' });
  });

  it('no borra una misión que ya no está pendiente', () => {
    const state = makeState(
      [makeCharacter()],
      [makeMission({ id: 'm1', status: 'completed', completedDate: TODAY, heartsAwarded: 5 })],
    );
    expect(deleteMission(state, 'm1')).toEqual({ ok: false, error: 'mission_not_pending' });
  });
});
