// Tests del motor de reactividad (P8-a, motor-reactividad-spec.md del vault).
// Cubre: un fixture por estado R2, por disparador R3, por hito A1 (incluyendo "ya mostrado
// -> no repite"), prioridad (overdueDebt gana sobre atRisk), y acknowledgeMilestone.
// El motor es PURO: today entra como parámetro, la variante se inyecta por opts.

import { describe, expect, it } from 'vitest';
import type { Character, GameState, Mission } from '../types';
import { SCHEMA_VERSION } from './constants';
import { addDays } from './dates';
import { acknowledgeMilestone, createCharacter } from './engine';
import {
  deriveSignals,
  reactionFor,
  resultNeedsContinue,
  type Celebration,
  type MilestoneReaction,
} from './reaction';
import { CELEBRATION_COPY, MILESTONE_COPY, STATE_COPY } from './reactionCopy';

const TODAY = '2026-06-15';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const createdDate = overrides.createdDate ?? addDays(TODAY, -3);
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

let seq = 0;
function completed(overrides: Partial<Mission> = {}): Mission {
  return {
    id: `m-${seq++}`,
    characterId: 'char-1',
    name: 'Misión',
    difficulty: 'easy',
    deadline: addDays(TODAY, 1),
    status: 'completed',
    completedDate: TODAY,
    heartsAwarded: 5,
    ...overrides,
  };
}

function pending(overrides: Partial<Mission> = {}): Mission {
  return {
    id: `m-${seq++}`,
    characterId: 'char-1',
    name: 'Misión',
    difficulty: 'easy',
    deadline: addDays(TODAY, 3),
    status: 'pending',
    completedDate: null,
    heartsAwarded: null,
    ...overrides,
  };
}

// --- R2: un fixture por estado ---

describe('R2 — estados reactivos (un fixture por estado)', () => {
  it('brandNew: sin misiones completadas', () => {
    const r = reactionFor(makeCharacter(), [], TODAY);
    expect(r.state).toBe('brandNew');
    expect(STATE_COPY.brandNew.character).toContain(r.characterLine);
    expect(r.sprite).toBe('normal');
  });

  it('firstDone: exactamente una completada', () => {
    const char = makeCharacter();
    const r = reactionFor(char, [completed()], TODAY);
    expect(r.state).toBe('firstDone');
  });

  it('goodStreak: 2 completadas en 7 días, sin riesgo', () => {
    const char = makeCharacter();
    const missions = [
      completed({ completedDate: TODAY }),
      completed({ completedDate: addDays(TODAY, -2) }),
      completed({ completedDate: addDays(TODAY, -5) }),
    ];
    const r = reactionFor(char, missions, TODAY);
    expect(r.state).toBe('goodStreak');
  });

  it('atRisk: 14-20 días de inactividad', () => {
    const char = makeCharacter({
      inactivitySince: addDays(TODAY, -16),
      createdDate: addDays(TODAY, -40),
    });
    const r = reactionFor(char, [completed({ completedDate: addDays(TODAY, -16) })], TODAY);
    expect(r.state).toBe('atRisk');
    expect(r.sprite).toBe('sad');
  });

  it('cameBack: hoy hubo actividad tras un hueco de 14+ días', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -40), inactivitySince: TODAY });
    const missions = [
      completed({ completedDate: addDays(TODAY, -20) }),
      completed({ completedDate: TODAY }),
    ];
    const r = reactionFor(char, missions, TODAY);
    expect(r.state).toBe('cameBack');
  });

  it('nearLevelUp: progreso >= 80% del nivel actual', () => {
    // Nivel 0, umbral nivel 1 = 20 corazones; 17/20 = 85%.
    const char = makeCharacter({ level: 0, heartsTotal: 17 });
    const missions = [
      completed({ completedDate: TODAY }),
      completed({ completedDate: addDays(TODAY, -10) }),
    ];
    const r = reactionFor(char, missions, TODAY);
    expect(r.state).toBe('nearLevelUp');
  });

  it('firstHardDone: la última completada fue difícil', () => {
    // level 1, hearts 28 -> progreso 8/40 = 20% (lejos de nearLevelUp); solo 1 en 7 días
    // (no goodStreak), última completada hard.
    const char = makeCharacter({ level: 1, heartsTotal: 28 });
    const missions = [
      completed({ completedDate: addDays(TODAY, -10), difficulty: 'easy' }),
      completed({ completedDate: TODAY, difficulty: 'hard', heartsAwarded: 18 }),
    ];
    const r = reactionFor(char, missions, TODAY);
    expect(r.state).toBe('firstHardDone');
  });

  it('overdueDebt: una pendiente con deadline pasado', () => {
    const char = makeCharacter();
    const missions = [
      completed({ completedDate: addDays(TODAY, -5) }),
      completed({ completedDate: addDays(TODAY, -6) }),
      pending({ deadline: addDays(TODAY, -2) }),
    ];
    const r = reactionFor(char, missions, TODAY);
    expect(r.state).toBe('overdueDebt');
    expect(r.sprite).toBe('normal'); // neutral, no triste
  });

  it('default: completó hace rato, sin nada especial', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -3) });
    const missions = [completed({ completedDate: addDays(TODAY, -4) }), completed({ completedDate: addDays(TODAY, -10) })];
    const r = reactionFor(char, missions, TODAY);
    expect(r.state).toBe('default');
    expect(r.cupidoLine).toBeNull(); // Cupido no satura el default idle
  });
});

// --- Prioridad ---

describe('R2 — prioridad de estados', () => {
  it('overdueDebt gana sobre atRisk', () => {
    const char = makeCharacter({
      createdDate: addDays(TODAY, -40),
      inactivitySince: addDays(TODAY, -16), // atRisk
    });
    const missions = [
      completed({ completedDate: addDays(TODAY, -16) }),
      pending({ deadline: addDays(TODAY, -3) }), // overdue
    ];
    const r = reactionFor(char, missions, TODAY);
    expect(r.state).toBe('overdueDebt');
  });

  it('atRisk gana sobre cameBack/nearLevelUp/goodStreak cuando todas aplican menos overdue', () => {
    const char = makeCharacter({
      createdDate: addDays(TODAY, -40),
      inactivitySince: addDays(TODAY, -15),
      heartsTotal: 18,
    });
    const missions = [completed({ completedDate: addDays(TODAY, -15) })];
    const r = reactionFor(char, missions, TODAY);
    expect(r.state).toBe('atRisk');
  });
});

// --- Variantes inyectadas ---

describe('selección de variante (determinista)', () => {
  it('variantIndex elige la variante y se moduliza', () => {
    const char = makeCharacter();
    const variants = STATE_COPY.brandNew.character;
    expect(reactionFor(char, [], TODAY, { variantIndex: 0 }).characterLine).toBe(variants[0]);
    expect(reactionFor(char, [], TODAY, { variantIndex: 1 }).characterLine).toBe(variants[1]);
    // se envuelve
    expect(reactionFor(char, [], TODAY, { variantIndex: variants.length }).characterLine).toBe(
      variants[0],
    );
  });
});

// --- R3: celebración (un fixture por disparador) ---

describe('R3 — celebración de frecuencia', () => {
  it('no evalúa celebración si evaluateCelebration no está activo', () => {
    const char = makeCharacter();
    const missions = [
      completed({ completedDate: TODAY }),
      completed({ completedDate: addDays(TODAY, -1) }),
      completed({ completedDate: addDays(TODAY, -2) }),
    ];
    expect(reactionFor(char, missions, TODAY).celebration).toBeNull();
  });

  it('threeInWeek: 3 completadas en 7 días (con una penalización, no es semana perfecta)', () => {
    const char = makeCharacter();
    const missions = [
      completed({ completedDate: TODAY }),
      completed({ completedDate: addDays(TODAY, -3) }),
      completed({ completedDate: addDays(TODAY, -5) }),
      pending({ status: 'cancelled', deadline: addDays(TODAY, -2), heartsAwarded: -3 }),
    ];
    const r = reactionFor(char, missions, TODAY, { evaluateCelebration: true });
    expect(r.celebration?.trigger).toBe('threeInWeek');
    expect(CELEBRATION_COPY.threeInWeek.character).toContain(r.celebration?.characterLine);
  });

  it('consecutiveDays: dos días seguidos cumpliendo (sin llegar a 3 en la ventana)', () => {
    const char = makeCharacter();
    const missions = [
      completed({ completedDate: TODAY }),
      completed({ completedDate: addDays(TODAY, -1) }),
    ];
    const r = reactionFor(char, missions, TODAY, { evaluateCelebration: true });
    expect(r.celebration?.trigger).toBe('consecutiveDays');
  });

  it('perfectWeek: 3+ en 7 días, sin deuda vencida ni penalizaciones', () => {
    const char = makeCharacter();
    const missions = [
      completed({ completedDate: TODAY }),
      completed({ completedDate: addDays(TODAY, -2) }),
      completed({ completedDate: addDays(TODAY, -4) }),
    ];
    const r = reactionFor(char, missions, TODAY, { evaluateCelebration: true });
    expect(r.celebration?.trigger).toBe('perfectWeek');
  });
});

// --- A1: hitos (un fixture por hito + ya mostrado) ---

describe('A1 — hitos / aniversarios', () => {
  it('week1: 7+ días juntos', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -7) });
    const r = reactionFor(char, [completed({ completedDate: TODAY })], TODAY);
    expect(r.milestone?.id).toBe('week1');
    expect(r.milestone?.line).toBe(MILESTONE_COPY.week1.character);
    expect(r.milestone?.big).toBe(false); // week1 es menor -> toast
  });

  it('missions10: 10+ completadas', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -2) });
    const missions = Array.from({ length: 10 }, (_, i) =>
      completed({ completedDate: addDays(TODAY, -i) }),
    );
    const r = reactionFor(char, missions, TODAY);
    expect(r.milestone?.id).toBe('missions10');
    expect(r.milestone?.big).toBe(true); // grande -> cuadro de Cupido
  });

  it('day30: 30+ días juntos', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -30) });
    const r = reactionFor(char, [completed({ completedDate: TODAY })], TODAY);
    // day30 tiene prioridad sobre week1 en el orden de evaluación de hitos
    expect(r.milestone?.id).toBe('week1'); // week1 va primero en la lista de alcanzados pendientes
    const acked = acknowledgeMilestone(
      { schemaVersion: SCHEMA_VERSION, onboarded: true, lastExportDate: null, characters: [char], missions: [], happyEndings: [] },
      char.id,
      'week1',
    );
    const char2 = acked.characters[0];
    const r2 = reactionFor(char2, [completed({ completedDate: TODAY })], TODAY);
    expect(r2.milestone?.id).toBe('day30');
    expect(r2.milestone?.big).toBe(true);
  });

  it('firstHard: hay al menos una difícil completada', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -2) });
    const missions = [completed({ completedDate: TODAY, difficulty: 'hard', heartsAwarded: 18 })];
    const r = reactionFor(char, missions, TODAY);
    expect(r.milestone?.id).toBe('firstHard');
  });

  it('day66: 66+ días juntos', () => {
    const char = makeCharacter({
      createdDate: addDays(TODAY, -66),
      // ya reconoció los anteriores
      milestonesShown: ['week1', 'day30', 'firstHard', 'missions10'],
    });
    const r = reactionFor(char, [completed({ completedDate: TODAY })], TODAY);
    expect(r.milestone?.id).toBe('day66');
  });

  it('hito ya mostrado -> NO se repite (pasa al siguiente pendiente o null)', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -7), milestonesShown: ['week1'] });
    const r = reactionFor(char, [completed({ completedDate: TODAY })], TODAY);
    expect(r.milestone).toBeNull();
  });

  it('sin hitos alcanzados -> milestone null', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -2) });
    const r = reactionFor(char, [completed({ completedDate: TODAY })], TODAY);
    expect(r.milestone).toBeNull();
  });
});

// --- acknowledgeMilestone ---

describe('acknowledgeMilestone', () => {
  function stateWith(char: Character): GameState {
    return { schemaVersion: SCHEMA_VERSION, onboarded: true, lastExportDate: null, characters: [char], missions: [], happyEndings: [] };
  }

  it('agrega el id a milestonesShown', () => {
    const state = stateWith(makeCharacter());
    const next = acknowledgeMilestone(state, 'char-1', 'week1');
    expect(next.characters[0].milestonesShown).toEqual(['week1']);
  });

  it('es idempotente (no duplica un id ya presente)', () => {
    const state = stateWith(makeCharacter({ milestonesShown: ['week1'] }));
    const next = acknowledgeMilestone(state, 'char-1', 'week1');
    expect(next.characters[0].milestonesShown).toEqual(['week1']);
    expect(next).toBe(state); // sin cambios -> mismo objeto
  });

  it('personaje inexistente no rompe', () => {
    const state = stateWith(makeCharacter());
    expect(acknowledgeMilestone(state, 'nope', 'week1')).toBe(state);
  });
});

// --- createCharacter inicializa el campo ---

describe('createCharacter — milestonesShown default', () => {
  it('un personaje nuevo nace con milestonesShown: []', () => {
    const state: GameState = {
      schemaVersion: SCHEMA_VERSION,
      onboarded: true,
      lastExportDate: null,
      characters: [],
      missions: [],
      happyEndings: [],
    };
    const result = createCharacter(state, 'Lectura', TODAY);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.character.milestonesShown).toEqual([]);
  });
});

// --- deriveSignals separado de la selección ---

describe('deriveSignals', () => {
  it('expone las señales crudas de la sección 1 del spec', () => {
    const char = makeCharacter({ createdDate: addDays(TODAY, -30), heartsTotal: 17 });
    const missions = [
      completed({ completedDate: TODAY, difficulty: 'hard', heartsAwarded: 18 }),
      completed({ completedDate: addDays(TODAY, -1) }),
    ];
    const s = deriveSignals(char, missions, TODAY);
    expect(s.daysTogether).toBe(30);
    expect(s.completedCount).toBe(2);
    expect(s.missionsLast7Days).toBe(2);
    expect(s.firstHardDone).toBe(true);
    expect(s.lastDifficulty).toBe('hard');
    expect(s.consecutiveDays).toBe(true);
    expect(s.nearLevelUp).toBe(true);
  });
});

// --- resultNeedsContinue: ¿pantalla de resultado pide "Continuar" o auto-avanza? ---

describe('resultNeedsContinue (Fase 4 Ola 1.5)', () => {
  const celebration: Celebration = {
    trigger: 'threeInWeek',
    characterLine: 'Vamos volando.',
    cupidoLine: null,
  };
  const bigMilestone: MilestoneReaction = {
    id: 'day30',
    line: 'Un mes juntos.',
    cupidoLine: '¡Un mes!',
    big: true,
  };
  const minorMilestone: MilestoneReaction = {
    id: 'week1',
    line: 'Una semana.',
    cupidoLine: null,
    big: false,
  };

  it('complete normal (ambos null): auto-avanza, NO pide Continuar', () => {
    expect(resultNeedsContinue(null, null)).toBe(false);
  });

  it('hito menor solo: auto-avanza, NO pide Continuar', () => {
    expect(resultNeedsContinue(null, minorMilestone)).toBe(false);
  });

  it('hay celebración: pide Continuar (algo que leer)', () => {
    expect(resultNeedsContinue(celebration, null)).toBe(true);
  });

  it('hito GRANDE: pide Continuar (cuadro de Cupido)', () => {
    expect(resultNeedsContinue(null, bigMilestone)).toBe(true);
  });

  it('celebración + hito menor: pide Continuar (la celebración manda)', () => {
    expect(resultNeedsContinue(celebration, minorMilestone)).toBe(true);
  });
});
