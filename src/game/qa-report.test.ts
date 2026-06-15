// Port de los 42 casos de docs/testing/qa-report.md como tests de Vitest.
// Cada test conserva su número TC-XXX para trazabilidad con el doc.
//
// Decisión de Hector (2026-06-11), refleja la nota al inicio de qa-report.md:
// heartsTotal es el único contador y baja con penalizaciones (mínimo 0); el nivel
// no baja por penalizaciones, solo por abandono. Los TCs que hablaban de
// hearts_current se leen ahora sobre heartsTotal.
//
// Decisión P4 de Hector (2026-06-12) — derecho de réplica: una misión vencida ya no se
// bloquea ni se auto-falla. El usuario elige: completarla tarde (recompensa reducida por
// el multiplicador de mecanicas-detalle §4) o aceptar la pérdida (failed + penalización +
// escena). TC-016, TC-024, TC-025 y TC-040 se actualizaron a ese contrato.
// Decisión P5 (2026-06-12): el deadline mínimo de una misión es HOY (antes mañana);
// createMission ahora recibe `today` y valida.

import { describe, expect, it } from 'vitest';
import type { Character, GameState, Mission } from '../types';
import { SCHEMA_VERSION } from './constants';
import { addDays } from './dates';
import {
  acceptMissionLoss,
  activeCharacters,
  cancelMission,
  checkAbandonment,
  completeMission,
  createCharacter,
  createMission,
  daysInactive,
  freeSlots,
  pendingMissions,
  rescheduleMission,
} from './engine';
import { levelForHearts } from './hearts';

const TODAY = '2026-06-11';
const FUTURE_DEADLINE = addDays(TODAY, 7);

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const createdDate = overrides.createdDate ?? addDays(TODAY, -5);
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
    deadline: FUTURE_DEADLINE,
    status: 'pending',
    completedDate: null,
    heartsAwarded: null,
    ...overrides,
  };
}

function makeState(characters: Character[] = [], missions: Mission[] = []): GameState {
  return { schemaVersion: SCHEMA_VERSION, onboarded: true, lastExportDate: null, characters, missions, happyEndings: [] };
}

function getCharacter(state: GameState, id: string): Character {
  const character = state.characters.find((c) => c.id === id);
  if (!character) throw new Error(`character not found: ${id}`);
  return character;
}

function getMission(state: GameState, id: string): Mission {
  const mission = state.missions.find((m) => m.id === id);
  if (!mission) throw new Error(`mission not found: ${id}`);
  return mission;
}

function expectCompleted(result: ReturnType<typeof completeMission>) {
  if (result.kind !== 'completed') throw new Error(`expected completed, got ${result.kind}`);
  return result;
}

describe('Área 1: Sistema de Corazones', () => {
  it('TC-001: suma correcta al completar misión Fácil', () => {
    const state = makeState([makeCharacter()], [makeMission({ difficulty: 'easy' })]);
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(5);
    expect(result.leveledUp).toBe(false);
  });

  it('TC-002: suma correcta al completar misión Media', () => {
    const state = makeState([makeCharacter()], [makeMission({ difficulty: 'medium' })]);
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(10);
    expect(result.leveledUp).toBe(false);
  });

  it('TC-003: suma correcta al completar misión Difícil', () => {
    const state = makeState([makeCharacter()], [makeMission({ difficulty: 'hard' })]);
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(18);
    expect(result.leveledUp).toBe(false);
  });

  it('TC-004: penalización correcta por cancelar misión Fácil', () => {
    const state = makeState([makeCharacter({ heartsTotal: 10 })], [makeMission({ difficulty: 'easy' })]);
    const result = cancelMission(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(7);
  });

  it('TC-005: penalización correcta por cancelar misión Media', () => {
    const state = makeState([makeCharacter({ heartsTotal: 10 })], [makeMission({ difficulty: 'medium' })]);
    const result = cancelMission(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(5);
  });

  it('TC-006: penalización correcta por cancelar misión Difícil', () => {
    const state = makeState([makeCharacter({ heartsTotal: 15 })], [makeMission({ difficulty: 'hard' })]);
    const result = cancelMission(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(7);
  });

  it('TC-007: la penalización resta heartsTotal pero el nivel no baja', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 50, level: 1 })],
      [makeMission({ difficulty: 'hard' })],
    );
    const result = cancelMission(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(42);
    expect(character.level).toBe(1);
  });

  it('TC-008: la penalización no baja el nivel aunque heartsTotal quede bajo el umbral', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 25, level: 1 })],
      [makeMission({ difficulty: 'hard' })],
    );
    const result = cancelMission(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(17);
    expect(character.level).toBe(1);
  });
});

describe('Área 2: Progresión de Niveles', () => {
  it('TC-009: subida de nivel 0 → 1 al cruzar el umbral de 20', () => {
    const state = makeState([makeCharacter({ heartsTotal: 15 })], [makeMission({ difficulty: 'medium' })]);
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(25);
    expect(character.level).toBe(1);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(1);
  });

  it('TC-010: no sube nivel con heartsTotal = 19 (un punto antes del umbral)', () => {
    const state = makeState([makeCharacter({ heartsTotal: 14 })], [makeMission({ difficulty: 'easy' })]);
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(19);
    expect(character.level).toBe(0);
    expect(result.leveledUp).toBe(false);
  });

  it('TC-011: subida de nivel 1 → 2 al cruzar el umbral de 60', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 55, level: 1 })],
      [makeMission({ difficulty: 'hard' })],
    );
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(73);
    expect(character.level).toBe(2);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('TC-012: no sube dos niveles de golpe', () => {
    const state = makeState([makeCharacter({ heartsTotal: 18 })], [makeMission({ difficulty: 'hard' })]);
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(36);
    expect(character.level).toBe(1);
    expect(result.newLevel).toBe(1);
  });

  it('TC-013: subida de nivel 2 → 3 al cruzar el umbral de 140 dispara boda', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 135, level: 2 })],
      [makeMission({ difficulty: 'hard' })],
    );
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(153);
    expect(character.level).toBe(3);
    expect(result.wedding).toBe(true);
  });
});

describe('Área 3: Escenas', () => {
  it('TC-014: la escena de nivel aparece solo al cruzar umbral', () => {
    const state = makeState([makeCharacter({ heartsTotal: 10 })], [makeMission({ difficulty: 'easy' })]);
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(15);
    expect(result.leveledUp).toBe(false);
  });

  it('TC-015: escena de cancelación al cancelar una misión activa', () => {
    const state = makeState([makeCharacter({ heartsTotal: 10 })], [makeMission({ difficulty: 'easy' })]);
    const result = cancelMission(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const character = getCharacter(result.state, 'char-1');
    expect(character.pendingCancellationScene).toBe(true);
    expect(character.heartsTotal).toBe(7);
    expect(getMission(result.state, 'mission-1').status).toBe('cancelled');
  });

  // Actualizado por decisión P4 (2026-06-12): derecho de réplica — el vencimiento ya no
  // dispara la escena automáticamente al abrir; la escena llega cuando el usuario acepta
  // la pérdida en la Pantalla 4.
  it('TC-016: escena de cancelación al aceptar la pérdida de una misión vencida', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 10 })],
      [makeMission({ difficulty: 'easy', deadline: addDays(TODAY, -1) })],
    );
    const result = acceptMissionLoss(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.penalty).toBe(3);
    expect(getMission(result.state, 'mission-1').status).toBe('failed');
    const character = getCharacter(result.state, 'char-1');
    expect(character.pendingCancellationScene).toBe(true);
    expect(character.heartsTotal).toBe(7);
  });

  it('TC-017: escena de abandono exactamente a los 21 días sin actividad', () => {
    const state = makeState([
      makeCharacter({ heartsTotal: 25, level: 1, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const result = checkAbandonment(state, TODAY);
    expect(result.events).toHaveLength(1);
    const character = getCharacter(result.state, 'char-1');
    expect(character.pendingAbandonmentScene).toBe(true);
    expect(character.level).toBe(0);
    expect(character.heartsTotal).toBe(25);
  });

  it('TC-018: no hay escena de abandono con actividad reciente (20 días)', () => {
    const state = makeState([
      makeCharacter({ level: 1, heartsTotal: 25, lastMissionCompletedDate: addDays(TODAY, -20) }),
    ]);
    const result = checkAbandonment(state, TODAY);
    expect(result.events).toHaveLength(0);
    const character = getCharacter(result.state, 'char-1');
    expect(character.pendingAbandonmentScene).toBe(false);
    expect(character.level).toBe(1);
    expect(character.status).toBe('active');
  });
});

describe('Área 4: Abandono', () => {
  it('TC-019: 3 semanas sin actividad — baja de nivel 1 a 0, slot conservado', () => {
    const state = makeState([
      makeCharacter({ level: 1, heartsTotal: 30, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const result = checkAbandonment(state, TODAY);
    const character = getCharacter(result.state, 'char-1');
    expect(character.level).toBe(0);
    expect(character.status).toBe('active');
    expect(character.slotNumber).toBe(1);
  });

  it('TC-020: 3 semanas sin actividad — baja de nivel 2 a 1, slot conservado', () => {
    const state = makeState([
      makeCharacter({ level: 2, heartsTotal: 80, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const result = checkAbandonment(state, TODAY);
    const character = getCharacter(result.state, 'char-1');
    expect(character.level).toBe(1);
    expect(character.status).toBe('active');
    expect(character.slotNumber).toBe(1);
  });

  it('TC-021: 3 semanas sin actividad en nivel 0 — reseteo y slot liberado', () => {
    const state = makeState([
      makeCharacter({ level: 0, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const result = checkAbandonment(state, TODAY);
    const character = getCharacter(result.state, 'char-1');
    expect(character.status).toBe('abandoned');
    expect(character.slotNumber).toBeNull();
    expect(freeSlots(result.state)).toContain(1);
  });

  it('TC-022: el contador de inactividad se reinicia al completar una misión', () => {
    const state = makeState(
      [makeCharacter({ level: 1, heartsTotal: 25, lastMissionCompletedDate: addDays(TODAY, -18) })],
      [makeMission({ difficulty: 'easy' })],
    );
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    const character = getCharacter(result.state, 'char-1');
    expect(character.lastMissionCompletedDate).toBe(TODAY);
    expect(daysInactive(character, TODAY)).toBe(0);
    expect(checkAbandonment(result.state, TODAY).events).toHaveLength(0);
  });
});

describe('Abandono escalonado — el reloj nunca para (decisión Hector, 2026-06-11)', () => {
  it('45 días sin actividad en nivel 2: baja dos niveles acumulados (2 → 0)', () => {
    const state = makeState([
      makeCharacter({ level: 2, heartsTotal: 80, lastMissionCompletedDate: addDays(TODAY, -45) }),
    ]);
    const result = checkAbandonment(state, TODAY);
    expect(result.events).toEqual([
      { characterId: 'char-1', previousLevel: 2, newLevel: 0, slotFreed: false },
    ]);
    const character = getCharacter(result.state, 'char-1');
    expect(character.level).toBe(0);
    expect(character.status).toBe('active');
    // El reloj avanzó 42 días: solo quedan 3 días "usados" de la siguiente ventana
    expect(daysInactive(character, TODAY)).toBe(3);
  });

  it('43 días sin actividad en nivel 1: baja a 0 y el personaje se va', () => {
    const state = makeState([
      makeCharacter({ level: 1, heartsTotal: 25, lastMissionCompletedDate: addDays(TODAY, -43) }),
    ]);
    const result = checkAbandonment(state, TODAY);
    const character = getCharacter(result.state, 'char-1');
    expect(character.status).toBe('abandoned');
    expect(character.slotNumber).toBeNull();
    expect(character.heartsTotal).toBe(25);
  });

  it('el check es idempotente: correrlo dos veces el mismo día no penaliza doble', () => {
    const state = makeState([
      makeCharacter({ level: 2, heartsTotal: 80, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const first = checkAbandonment(state, TODAY);
    expect(first.events).toHaveLength(1);
    expect(getCharacter(first.state, 'char-1').level).toBe(1);
    const second = checkAbandonment(first.state, TODAY);
    expect(second.events).toHaveLength(0);
    expect(getCharacter(second.state, 'char-1').level).toBe(1);
  });
});

describe('Área 5: Cancelación', () => {
  it('TC-023: cambiar la fecha límite = cancelación automática + misión nueva', () => {
    const state = makeState([makeCharacter({ heartsTotal: 10 })], [makeMission({ difficulty: 'easy' })]);
    const newDeadline = addDays(TODAY, 10);
    const result = rescheduleMission(state, 'mission-1', newDeadline, TODAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getMission(result.state, 'mission-1').status).toBe('cancelled');
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(7);
    expect(character.pendingCancellationScene).toBe(true);
    expect(result.newMission.status).toBe('pending');
    expect(result.newMission.deadline).toBe(newDeadline);
    expect(result.newMission.difficulty).toBe('easy');
  });

  // Actualizado por decisión P4 (2026-06-12): derecho de réplica — una misión vencida
  // SÍ puede marcarse como completada, con la recompensa reducida (2 días tarde → 75%).
  it('TC-024: misión vencida sí puede completarse tarde con recompensa reducida', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 10 })],
      [makeMission({ difficulty: 'easy', deadline: addDays(TODAY, -2) })],
    );
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(result.heartsEarned).toBe(4); // ceil(5 × 0.75)
    expect(getMission(result.state, 'mission-1').status).toBe('completed');
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(14);
    expect(character.pendingCancellationScene).toBe(false);
  });

  // Actualizado por decisión P4 (2026-06-12): derecho de réplica — la penalización por
  // vencimiento ya no es automática; se aplica al aceptar la pérdida.
  it('TC-025: penalización correcta al aceptar la pérdida de una misión vencida', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 20, level: 1 })],
      [makeMission({ difficulty: 'medium', deadline: addDays(TODAY, -1) })],
    );
    const result = acceptMissionLoss(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.penalty).toBe(5);
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(15);
    expect(character.level).toBe(1);
  });
});

describe('Área 6: Nivel 3 / Boda', () => {
  function weddingState(): GameState {
    return makeState(
      [makeCharacter({ heartsTotal: 139, level: 2 })],
      [makeMission({ difficulty: 'easy' })],
    );
  }

  it('TC-026: al llegar a nivel 3 aparece escena de boda (no escena genérica)', () => {
    const result = expectCompleted(completeMission(weddingState(), 'mission-1', TODAY));
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(144);
    expect(character.level).toBe(3);
    expect(result.wedding).toBe(true);
  });

  it('TC-027: personaje archivado en HappyEnding después de la boda', () => {
    const result = expectCompleted(completeMission(weddingState(), 'mission-1', TODAY));
    expect(result.state.happyEndings).toHaveLength(1);
    expect(result.state.happyEndings[0]).toMatchObject({
      characterName: 'Gym',
      originalCharacterId: 'char-1',
      weddingDate: TODAY,
    });
    expect(activeCharacters(result.state).map((c) => c.id)).not.toContain('char-1');
    expect(getCharacter(result.state, 'char-1').status).toBe('happy_ending');
  });

  it('TC-028: slot liberado correctamente después de la boda', () => {
    const state = makeState(
      [
        makeCharacter({ id: 'char-1', heartsTotal: 139, level: 2, slotNumber: 1 }),
        makeCharacter({ id: 'char-2', name: 'Leer', slotNumber: 2 }),
        makeCharacter({ id: 'char-3', name: 'Meditar', slotNumber: 3 }),
      ],
      [makeMission({ difficulty: 'easy' })],
    );
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(activeCharacters(result.state)).toHaveLength(2);
    const created = createCharacter(result.state, 'Dormir bien', TODAY);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.character.slotNumber).toBe(1);
  });

  it('TC-029: personaje en HappyEnding no tiene misiones activas ni genera triggers', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 139, level: 2 })],
      [
        makeMission({ id: 'mission-1', difficulty: 'easy' }),
        makeMission({ id: 'mission-2', name: 'Otra misión' }),
      ],
    );
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(pendingMissions(result.state, 'char-1')).toHaveLength(0);
    const newMission = createMission(result.state, 'char-1', 'Nueva', 'easy', FUTURE_DEADLINE, TODAY);
    expect(newMission).toEqual({ ok: false, error: 'character_not_active' });
    // Mucho tiempo después, el personaje archivado no dispara abandono
    const abandonment = checkAbandonment(result.state, addDays(TODAY, 60));
    expect(abandonment.events).toHaveLength(0);
  });
});

describe('Área 7: Límites', () => {
  function threePendingState(): GameState {
    return makeState(
      [makeCharacter()],
      [
        makeMission({ id: 'mission-1' }),
        makeMission({ id: 'mission-2', name: 'Misión 2' }),
        makeMission({ id: 'mission-3', name: 'Misión 3' }),
      ],
    );
  }

  it('TC-030: no se puede agregar una 4ta misión pendiente al mismo personaje', () => {
    const state = threePendingState();
    const result = createMission(state, 'char-1', 'Misión 4', 'easy', FUTURE_DEADLINE, TODAY);
    expect(result).toEqual({ ok: false, error: 'pending_limit_reached' });
    expect(pendingMissions(state, 'char-1')).toHaveLength(3);
  });

  it('TC-031: sí se puede agregar misión si hay menos de 3 pendientes', () => {
    const state = makeState(
      [makeCharacter()],
      [makeMission({ id: 'mission-1' }), makeMission({ id: 'mission-2', name: 'Misión 2' })],
    );
    const result = createMission(state, 'char-1', 'Misión 3', 'medium', FUTURE_DEADLINE, TODAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(pendingMissions(result.state, 'char-1')).toHaveLength(3);
  });

  it('TC-032: no se puede activar un 4to personaje simultáneo', () => {
    const state = makeState([
      makeCharacter({ id: 'char-1', slotNumber: 1 }),
      makeCharacter({ id: 'char-2', name: 'Leer', slotNumber: 2 }),
      makeCharacter({ id: 'char-3', name: 'Meditar', slotNumber: 3 }),
    ]);
    const result = createCharacter(state, 'Cuarto', TODAY);
    expect(result).toEqual({ ok: false, error: 'no_free_slot' });
    expect(activeCharacters(state)).toHaveLength(3);
  });

  it('TC-033: sí se puede activar personaje si hay menos de 3 activos', () => {
    const state = makeState([
      makeCharacter({ id: 'char-1', slotNumber: 1 }),
      makeCharacter({ id: 'char-2', name: 'Leer', slotNumber: 2 }),
    ]);
    const result = createCharacter(state, 'Meditar', TODAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.character.slotNumber).toBe(3);
    expect(activeCharacters(result.state)).toHaveLength(3);
  });

  it('TC-034: completar una misión libera el cupo y permite agregar una nueva', () => {
    const state = threePendingState();
    const completed = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(pendingMissions(completed.state, 'char-1')).toHaveLength(2);
    const result = createMission(completed.state, 'char-1', 'Misión 4', 'easy', FUTURE_DEADLINE, TODAY);
    expect(result.ok).toBe(true);
  });
});

describe('Área 8: Edge Cases', () => {
  it('TC-035: con heartsTotal = 19 el nivel sigue siendo 0 (el umbral es 20)', () => {
    expect(levelForHearts(19)).toBe(0);
    expect(levelForHearts(20)).toBe(1);
  });

  it('TC-036: penalización que llevaría heartsTotal a negativo se clampea a 0', () => {
    // mecanicas-detalle §3: el mínimo es 0, sin "deuda" de corazones.
    const state = makeState([makeCharacter({ heartsTotal: 4 })], [makeMission({ difficulty: 'hard' })]);
    const result = cancelMission(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(0);
  });

  it('TC-037: slot recién liberado por boda disponible para nuevo personaje', () => {
    const state = makeState(
      [
        makeCharacter({ id: 'char-1', heartsTotal: 139, level: 2, slotNumber: 1 }),
        makeCharacter({ id: 'char-2', name: 'Leer', slotNumber: 2 }),
        makeCharacter({ id: 'char-3', name: 'Meditar', slotNumber: 3 }),
      ],
      [makeMission({ difficulty: 'easy' })],
    );
    const afterWedding = expectCompleted(completeMission(state, 'mission-1', TODAY));
    const created = createCharacter(afterWedding.state, 'Dormir bien', TODAY);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(activeCharacters(created.state)).toHaveLength(3);
    expect(created.state.happyEndings).toHaveLength(1);
  });

  it('TC-038: slot recién liberado por abandono en nivel 0 disponible para nuevo personaje', () => {
    const state = makeState([
      makeCharacter({ level: 0, lastMissionCompletedDate: addDays(TODAY, -25) }),
    ]);
    const abandoned = checkAbandonment(state, TODAY);
    expect(getCharacter(abandoned.state, 'char-1').status).toBe('abandoned');
    const created = createCharacter(abandoned.state, 'Nuevo hábito', TODAY);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.character.slotNumber).toBe(1);
    expect(activeCharacters(created.state)).toHaveLength(1);
  });

  it('TC-039: misión completada el día exacto de la fecha límite no está vencida', () => {
    const state = makeState([makeCharacter()], [makeMission({ difficulty: 'easy', deadline: TODAY })]);
    const result = completeMission(state, 'mission-1', TODAY);
    expect(result.kind).toBe('completed');
    if (result.kind !== 'completed') return;
    expect(result.heartsEarned).toBe(5);
    expect(getCharacter(result.state, 'char-1').pendingCancellationScene).toBe(false);
  });

  // Actualizado por decisión P4 (2026-06-12): derecho de réplica — completar un día tarde
  // ya no falla la misión; otorga la recompensa con el multiplicador del primer tramo (75%).
  it('TC-040: misión completada un día después de la fecha límite gana recompensa reducida', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 10 })],
      [makeMission({ difficulty: 'easy', deadline: addDays(TODAY, -1) })],
    );
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(result.heartsEarned).toBe(4); // ceil(5 × 0.75)
    expect(getMission(result.state, 'mission-1').status).toBe('completed');
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(14);
  });

  it('TC-041: acumulación de penalizaciones en la misma sesión no rompe el estado', () => {
    let state = makeState(
      [makeCharacter({ heartsTotal: 60, level: 2 })],
      [
        makeMission({ id: 'mission-1', difficulty: 'easy' }),
        makeMission({ id: 'mission-2', difficulty: 'medium', name: 'Media' }),
        makeMission({ id: 'mission-3', difficulty: 'hard', name: 'Difícil' }),
      ],
    );
    for (const missionId of ['mission-1', 'mission-2', 'mission-3']) {
      const result = cancelMission(state, missionId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      state = result.state;
      expect(getCharacter(state, 'char-1').pendingCancellationScene).toBe(true);
    }
    const character = getCharacter(state, 'char-1');
    expect(character.heartsTotal).toBe(44);
    expect(character.level).toBe(2);
    expect(state.missions.every((m) => m.status === 'cancelled')).toBe(true);
  });

  it('TC-042: el abandono baja el nivel pero heartsTotal se mantiene', () => {
    const state = makeState([
      makeCharacter({ heartsTotal: 25, level: 1, lastMissionCompletedDate: addDays(TODAY, -21) }),
    ]);
    const result = checkAbandonment(state, TODAY);
    const character = getCharacter(result.state, 'char-1');
    expect(character.level).toBe(0);
    expect(character.heartsTotal).toBe(25);
  });
});

describe('P4: derecho de réplica para misiones vencidas (decisión Hector, 2026-06-12)', () => {
  function expiredState(daysLate: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): GameState {
    return makeState(
      [makeCharacter({ heartsTotal: 10 })],
      [makeMission({ difficulty, deadline: addDays(TODAY, -daysLate) })],
    );
  }

  it('completar con 1 día de retraso aplica el 75% (mecanicas-detalle §4)', () => {
    const result = expectCompleted(completeMission(expiredState(1), 'mission-1', TODAY));
    expect(result.heartsEarned).toBe(8); // ceil(10 × 0.75)
    expect(getCharacter(result.state, 'char-1').heartsTotal).toBe(18);
  });

  it('completar con 3 días de retraso sigue en el tramo del 75%', () => {
    const result = expectCompleted(completeMission(expiredState(3), 'mission-1', TODAY));
    expect(result.heartsEarned).toBe(8); // ceil(10 × 0.75)
  });

  it('completar con 5 días de retraso aplica el 50%', () => {
    const result = expectCompleted(completeMission(expiredState(5), 'mission-1', TODAY));
    expect(result.heartsEarned).toBe(5); // 10 × 0.5
  });

  it('completar con 30 días de retraso aplica el piso del 25% (sin ventana límite)', () => {
    const result = expectCompleted(completeMission(expiredState(30, 'hard'), 'mission-1', TODAY));
    expect(result.heartsEarned).toBe(5); // ceil(18 × 0.25)
    expect(getMission(result.state, 'mission-1').status).toBe('completed');
  });

  it('completar tarde reinicia el reloj de abandono como cualquier misión completada', () => {
    const result = expectCompleted(completeMission(expiredState(2), 'mission-1', TODAY));
    const character = getCharacter(result.state, 'char-1');
    expect(character.lastMissionCompletedDate).toBe(TODAY);
    expect(character.inactivitySince).toBe(TODAY);
  });

  it('completar tarde puede subir de nivel con la recompensa reducida', () => {
    const state = makeState(
      [makeCharacter({ heartsTotal: 15 })],
      [makeMission({ difficulty: 'medium', deadline: addDays(TODAY, -1) })],
    );
    const result = expectCompleted(completeMission(state, 'mission-1', TODAY));
    expect(result.heartsEarned).toBe(8);
    expect(result.leveledUp).toBe(true); // 15 + 8 = 23 ≥ 20
    expect(result.newLevel).toBe(1);
  });

  it('aceptar la pérdida mantiene el flujo anterior: failed + penalización + escena', () => {
    const result = acceptMissionLoss(expiredState(4), 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.penalty).toBe(5);
    expect(getMission(result.state, 'mission-1').status).toBe('failed');
    expect(getMission(result.state, 'mission-1').heartsAwarded).toBe(-5);
    const character = getCharacter(result.state, 'char-1');
    expect(character.heartsTotal).toBe(5);
    expect(character.pendingCancellationScene).toBe(true);
  });

  it('aceptar la pérdida NO reinicia el reloj de abandono (punto 3 de la decisión)', () => {
    const inactivitySince = addDays(TODAY, -10);
    const state = makeState(
      [makeCharacter({ heartsTotal: 10, lastMissionCompletedDate: inactivitySince })],
      [makeMission({ difficulty: 'easy', deadline: addDays(TODAY, -1) })],
    );
    const result = acceptMissionLoss(state, 'mission-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getCharacter(result.state, 'char-1').inactivitySince).toBe(inactivitySince);
  });

  it('aceptar la pérdida de una misión ya cerrada devuelve error', () => {
    const state = makeState(
      [makeCharacter()],
      [makeMission({ status: 'completed', completedDate: TODAY, heartsAwarded: 5 })],
    );
    expect(acceptMissionLoss(state, 'mission-1')).toEqual({ ok: false, error: 'mission_not_pending' });
  });

  it('las vencidas pendientes siguen contando para el tope de 3 misiones (la deuda ocupa espacio)', () => {
    const state = makeState(
      [makeCharacter()],
      [
        makeMission({ id: 'mission-1', deadline: addDays(TODAY, -3) }),
        makeMission({ id: 'mission-2', name: 'Misión 2', deadline: addDays(TODAY, -1) }),
        makeMission({ id: 'mission-3', name: 'Misión 3' }),
      ],
    );
    const result = createMission(state, 'char-1', 'Misión 4', 'easy', FUTURE_DEADLINE, TODAY);
    expect(result).toEqual({ ok: false, error: 'pending_limit_reached' });
    // Resolver una vencida (aceptando la pérdida) libera el cupo
    const accepted = acceptMissionLoss(state, 'mission-1');
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    const retry = createMission(accepted.state, 'char-1', 'Misión 4', 'easy', FUTURE_DEADLINE, TODAY);
    expect(retry.ok).toBe(true);
  });
});

describe('P5: deadline mínimo HOY (decisión Hector, 2026-06-12)', () => {
  it('se puede crear una misión con deadline hoy', () => {
    // Antes el mínimo era mañana; el modelo mental del hábito es "hoy hago X".
    const state = makeState([makeCharacter()]);
    const result = createMission(state, 'char-1', 'Hoy mismo', 'easy', TODAY, TODAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mission.deadline).toBe(TODAY);
    // Y completarla hoy mismo no está vencida (TC-039): recompensa completa
    const completed = expectCompleted(completeMission(result.state, result.mission.id, TODAY));
    expect(completed.heartsEarned).toBe(5);
  });

  it('no se puede crear una misión con deadline anterior a hoy', () => {
    const state = makeState([makeCharacter()]);
    const result = createMission(state, 'char-1', 'Ayer', 'easy', addDays(TODAY, -1), TODAY);
    expect(result).toEqual({ ok: false, error: 'deadline_in_past' });
  });

  it('rescheduleMission rechaza una fecha nueva en el pasado SIN penalizar', () => {
    const state = makeState([makeCharacter({ heartsTotal: 10 })], [makeMission()]);
    const result = rescheduleMission(state, 'mission-1', addDays(TODAY, -1), TODAY);
    expect(result).toEqual({ ok: false, error: 'deadline_in_past' });
    // El estado original no se tocó: la misión sigue pendiente y sin penalización
    expect(getMission(state, 'mission-1').status).toBe('pending');
    expect(getCharacter(state, 'char-1').heartsTotal).toBe(10);
  });

  it('rescheduleMission acepta mover el deadline a hoy', () => {
    const state = makeState([makeCharacter({ heartsTotal: 10 })], [makeMission()]);
    const result = rescheduleMission(state, 'mission-1', TODAY, TODAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.newMission.deadline).toBe(TODAY);
  });
});
