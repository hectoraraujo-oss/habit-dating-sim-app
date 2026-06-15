// Tests de la construcción de escenas de apertura (QA M1).
// Antes, los flags pendingAbandonmentScene/pendingCancellationScene eran write-only:
// si el usuario cerraba la app durante una escena (o importaba un respaldo con flags
// en true), la escena se perdía para siempre. buildStartup re-hidrata esos flags.

import { describe, expect, it } from 'vitest';
import type { Character, GameState, Mission } from '../types';
import { SCHEMA_VERSION } from './constants';
import { addDays } from './dates';
import { buildStartup } from './startup';

const TODAY = '2026-06-12';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const createdDate = overrides.createdDate ?? addDays(TODAY, -30);
  // Por default el personaje tiene actividad reciente: así el check de abandono de
  // hoy no dispara y cada test controla explícitamente qué evento quiere provocar.
  const lastMissionCompletedDate = overrides.lastMissionCompletedDate ?? addDays(TODAY, -1);
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
    milestonesShown: [],
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
  return { schemaVersion: SCHEMA_VERSION, onboarded: true, lastExportDate: null, characters, missions, happyEndings: [] };
}

describe('buildStartup — checks de esta apertura (comportamiento existente)', () => {
  it('estado limpio sin eventos no encola escenas', () => {
    const result = buildStartup(makeState([makeCharacter()]), TODAY);
    expect(result.startupScenes).toEqual([]);
  });

  // Actualizado por decisión P4 (2026-06-12): derecho de réplica — las vencidas ya no se
  // auto-fallan al abrir; quedan pendientes hasta que el usuario decida en la Pantalla 4.
  it('una misión vencida ya NO se auto-falla ni encola escena al abrir', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 10 })],
      [makeMission({ deadline: addDays(TODAY, -1) })],
    );
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([]);
    expect(result.state.missions[0].status).toBe('pending');
    // Sin penalización ni escena agendada: la deuda sigue siendo del usuario
    expect(result.state.characters[0].heartsTotal).toBe(10);
    expect(result.state.characters[0].pendingCancellationScene).toBe(false);
  });

  it('21 días de inactividad encolan la escena de abandono', () => {
    const state = makeState([
      makeCharacter({ level: 1, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([{ kind: 'abandonment', characterId: 'char-1' }]);
  });

  // P4 + checkAbandonment sin cambios: el reloj de abandono sigue corriendo aunque haya
  // una vencida pendiente sin resolver.
  it('una vencida pendiente no detiene el reloj de abandono', () => {
    const state = makeState(
      [makeCharacter({ level: 1, lastMissionCompletedDate: addDays(TODAY, -21) })],
      [makeMission({ deadline: addDays(TODAY, -5) })],
    );
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([{ kind: 'abandonment', characterId: 'char-1' }]);
    expect(result.state.characters[0].level).toBe(0);
    expect(result.state.missions[0].status).toBe('pending');
  });
});

describe('buildStartup — re-hidratación de flags pendientes (QA M1)', () => {
  it('flag de abandono en true sin evento nuevo produce escena encolada', () => {
    // Escenario: la escena se mostró en la apertura anterior pero el usuario cerró
    // la app sin tocar "Entendido". El check de hoy es idempotente (no hay evento),
    // pero el flag sigue en true y la escena debe volver a aparecer.
    const state = makeState([
      makeCharacter({ level: 0, pendingAbandonmentScene: true }),
    ]);
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([{ kind: 'abandonment', characterId: 'char-1' }]);
  });

  it('flag de abandono de un personaje ya abandonado también se re-hidrata', () => {
    // Respaldo importado con un personaje que se fue sin que la escena se reconociera.
    const state = makeState([
      makeCharacter({ status: 'abandoned', slotNumber: null, pendingAbandonmentScene: true }),
    ]);
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([{ kind: 'abandonment', characterId: 'char-1' }]);
  });

  it('flag de cancelación en true usa la misión failed/cancelled más reciente como referencia', () => {
    const state = makeState(
      [makeCharacter({ pendingCancellationScene: true })],
      [
        makeMission({ id: 'm1', status: 'failed', heartsAwarded: -3 }),
        makeMission({ id: 'm2', status: 'cancelled', heartsAwarded: -5 }),
        makeMission({ id: 'm3', status: 'completed', completedDate: TODAY, heartsAwarded: 5 }),
      ],
    );
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([
      { kind: 'cancellation', characterId: 'char-1', missionId: 'm2' },
    ]);
  });

  it('flag de cancelación sin ninguna misión failed/cancelled se limpia sin escena (sin crash)', () => {
    const state = makeState([makeCharacter({ pendingCancellationScene: true })]);
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([]);
    expect(result.state.characters[0].pendingCancellationScene).toBe(false);
  });

  // Actualizado por decisión P4 (2026-06-12): derecho de réplica — el check de hoy ya no
  // genera escenas de cancelación (las vencidas no se auto-fallan), pero los flags
  // pendientes de sesiones anteriores se siguen re-hidratando sin tocar la vencida.
  it('re-hidrata el flag de cancelación sin auto-fallar la vencida pendiente', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 10, pendingCancellationScene: true })],
      [
        makeMission({ id: 'm0', status: 'failed', heartsAwarded: -3 }),
        makeMission({ id: 'm1', deadline: addDays(TODAY, -1) }),
      ],
    );
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([
      { kind: 'cancellation', characterId: 'char-1', missionId: 'm0' },
    ]);
    expect(result.state.missions.find((m) => m.id === 'm1')?.status).toBe('pending');
  });

  it('no duplica la escena de abandono cuando el check de hoy ya la generó', () => {
    const state = makeState([
      makeCharacter({ level: 1, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const result = buildStartup(state, TODAY);
    expect(result.state.characters[0].pendingAbandonmentScene).toBe(true);
    expect(
      result.startupScenes.filter((s) => s.kind === 'abandonment' && s.characterId === 'char-1'),
    ).toHaveLength(1);
  });

  it('re-hidrata flags de varios personajes a la vez', () => {
    const state = makeState(
      [
        makeCharacter({ id: 'char-1', pendingAbandonmentScene: true }),
        makeCharacter({
          id: 'char-2',
          name: 'Lectura',
          slotNumber: 2,
          pendingCancellationScene: true,
        }),
      ],
      [makeMission({ id: 'm1', characterId: 'char-2', status: 'failed', heartsAwarded: -3 })],
    );
    const result = buildStartup(state, TODAY);
    expect(result.startupScenes).toEqual([
      { kind: 'abandonment', characterId: 'char-1' },
      { kind: 'cancellation', characterId: 'char-2', missionId: 'm1' },
    ]);
  });
});
