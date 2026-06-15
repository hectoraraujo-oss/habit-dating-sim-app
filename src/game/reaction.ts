// Motor de reactividad (P8-a) — CAPA DE LECTURA. Toma un Character + sus misiones +
// today y devuelve texto + expresión. NO escribe corazones, NO mueve niveles, NO toca
// inactivitySince ni dispara escenas. La única memoria persistente del sistema es
// Character.milestonesShown (A1), y este módulo solo la LEE para no repetir un hito.
//
// Diseño (spec §6):
//   1. deriveSignals(): Character + Mission[] + today -> Signals (sección 1 del spec).
//   2. selectReaction(): Signals -> Reaction (mapeo señal -> copy, prioridad fija).
// La aleatoriedad de variantes se INYECTA por opts.variantIndex (determinista, testeable);
// nunca se llama a Math.random() adentro.
//
// Ver reactionCopy.ts (las frases, que son data) y motor-reactividad-spec.md (vault).

import type { Character, Difficulty, Mission } from '../types';
import { AT_RISK_DAYS, ABANDONMENT_DAYS, MAX_LEVEL } from './constants';
import { daysBetween } from './dates';
import { heartsToNextLevel } from './hearts';
import {
  BIG_MILESTONES,
  CELEBRATION_COPY,
  MILESTONE_COPY,
  STATE_COPY,
  type CelebrationTrigger,
  type MilestoneId,
} from './reactionCopy';

// Estados R2 (spec §2). El orden de esta lista ES la prioridad de evaluación.
export type ReactionState =
  | 'overdueDebt'
  | 'atRisk'
  | 'cameBack'
  | 'nearLevelUp'
  | 'firstDone'
  | 'brandNew'
  | 'firstHardDone'
  | 'goodStreak'
  | 'default';

export type Sprite = 'normal' | 'sad';

export interface Celebration {
  trigger: CelebrationTrigger;
  characterLine: string;
  cupidoLine: string | null;
}

export interface MilestoneReaction {
  id: MilestoneId;
  line: string;
  cupidoLine: string | null;
  // Hitos grandes -> cuadro de Cupido; menores -> toast (spec §5).
  big: boolean;
}

export interface Reaction {
  characterLine: string;
  cupidoLine: string | null;
  sprite: Sprite;
  state: ReactionState;
  celebration: Celebration | null; // R3, solo en el path de completar
  milestone: MilestoneReaction | null; // A1, primer hito pendiente
}

export interface ReactionOpts {
  // Índice de variante (se moduliza contra el número de variantes del estado/disparador).
  // Determinista: el llamador decide cómo rotar (ej. evitar repetir la última).
  variantIndex?: number;
  // Si true, evalúa R3 (celebración) — solo tiene sentido en el instante de completar.
  evaluateCelebration?: boolean;
}

// --- 1. Derivación de señales (spec §1) ---

export interface Signals {
  daysTogether: number;
  daysInactive: number;
  atRisk: boolean;
  completedCount: number;
  brandNew: boolean;
  justCompletedFirst: boolean;
  missionsLast7Days: number;
  nearLevelUp: boolean;
  lastDifficulty: Difficulty | null;
  firstHardDone: boolean;
  cameBackAfterGap: boolean;
  overdueDebt: boolean;
  consecutiveDays: boolean;
  noPenaltiesLast7Days: boolean;
}

// Sprite "feliz/neutral" = normal, "triste" = sad (spec §2: el sprite hoy solo distingue dos).
const SPRITE: Record<ReactionState, Sprite> = {
  overdueDebt: 'normal', // neutral
  atRisk: 'sad',
  cameBack: 'normal',
  nearLevelUp: 'normal',
  firstDone: 'normal',
  brandNew: 'normal',
  firstHardDone: 'normal',
  goodStreak: 'normal',
  default: 'normal',
};

const GAP_THRESHOLD = AT_RISK_DAYS; // un "regreso" cuenta si el hueco fue de zona de riesgo (14+)
const NEAR_LEVEL_RATIO = 0.8;

function completedMissions(missions: Mission[]): Mission[] {
  return missions.filter((m) => m.status === 'completed' && m.completedDate !== null);
}

// Fechas distintas con al menos una misión completada, ordenadas ascendente.
function completedDates(missions: Mission[]): string[] {
  const set = new Set<string>();
  for (const m of completedMissions(missions)) set.add(m.completedDate as string);
  return [...set].sort();
}

export function deriveSignals(character: Character, missions: Mission[], today: string): Signals {
  const mine = missions.filter((m) => m.characterId === character.id);
  const completed = completedMissions(mine);
  const completedCount = completed.length;

  const daysTogether = Math.max(0, daysBetween(character.createdDate, today));
  const daysInactive = Math.max(0, daysBetween(character.inactivitySince, today));
  const atRisk =
    character.status === 'active' && daysInactive >= AT_RISK_DAYS && daysInactive < ABANDONMENT_DAYS;

  // missionsLast7Days: completadas con completedDate dentro de los últimos 7 días naturales.
  const missionsLast7Days = completed.filter((m) => {
    const d = daysBetween(m.completedDate as string, today);
    return d >= 0 && d < 7;
  }).length;

  // nearLevelUp: progreso dentro del nivel >= 80% y aún no en nivel máximo.
  const progress = heartsToNextLevel(character.level, character.heartsTotal);
  const nearLevelUp =
    character.level < MAX_LEVEL &&
    progress !== null &&
    progress.total > 0 &&
    progress.current / progress.total >= NEAR_LEVEL_RATIO;

  // lastDifficulty: dificultad de la completada más reciente (por completedDate).
  let lastDifficulty: Difficulty | null = null;
  let lastDate: string | null = null;
  for (const m of completed) {
    const d = m.completedDate as string;
    if (lastDate === null || d > lastDate) {
      lastDate = d;
      lastDifficulty = m.difficulty;
    }
  }

  const firstHardDone = completed.some((m) => m.difficulty === 'hard');

  // cameBackAfterGap: se deriva del HISTORIAL (no de inactivitySince, que se reinicia al
  // completar — nota del spec §1/§6). Hoy hubo actividad y el hueco entre las dos últimas
  // completedDate distintas fue de zona de riesgo (>= 14 días).
  const dates = completedDates(mine);
  let cameBackAfterGap = false;
  if (dates.length >= 2 && dates[dates.length - 1] === today) {
    const gap = daysBetween(dates[dates.length - 2], dates[dates.length - 1]);
    cameBackAfterGap = gap >= GAP_THRESHOLD;
  }

  // consecutiveDays: las dos últimas fechas distintas con actividad son días seguidos (R3).
  let consecutiveDays = false;
  if (dates.length >= 2) {
    consecutiveDays = daysBetween(dates[dates.length - 2], dates[dates.length - 1]) === 1;
  }

  // overdueDebt: alguna misión pendiente con deadline ya pasado.
  const overdueDebt = mine.some(
    (m) => m.status === 'pending' && daysBetween(m.deadline, today) > 0,
  );

  // noPenaltiesLast7Days: ninguna failed/cancelled en la ventana (refuerzo de "semana perfecta").
  const noPenaltiesLast7Days = !mine.some((m) => {
    if (m.status !== 'failed' && m.status !== 'cancelled') return false;
    // Las penalizaciones no tienen fecha propia; usamos el deadline como referencia de ventana.
    const d = daysBetween(m.deadline, today);
    return d >= 0 && d < 7;
  });

  return {
    daysTogether,
    daysInactive,
    atRisk,
    completedCount,
    brandNew: completedCount === 0,
    justCompletedFirst: completedCount === 1,
    missionsLast7Days,
    nearLevelUp,
    lastDifficulty,
    firstHardDone,
    cameBackAfterGap,
    overdueDebt,
    consecutiveDays,
    noPenaltiesLast7Days,
  };
}

// --- 2. Selección de estado R2 (prioridad fija del spec §2) ---

// Predicados en ORDEN de prioridad: overdueDebt > atRisk > cameBack > nearLevelUp >
// firstDone > brandNew > firstHardDone > goodStreak > default. El primero que matchea gana.
const STATE_PRIORITY: ReadonlyArray<{
  state: ReactionState;
  match: (s: Signals) => boolean;
}> = [
  { state: 'overdueDebt', match: (s) => s.overdueDebt },
  { state: 'atRisk', match: (s) => s.atRisk },
  { state: 'cameBack', match: (s) => s.cameBackAfterGap },
  { state: 'nearLevelUp', match: (s) => s.nearLevelUp },
  { state: 'firstDone', match: (s) => s.justCompletedFirst },
  { state: 'brandNew', match: (s) => s.brandNew },
  { state: 'firstHardDone', match: (s) => s.firstHardDone && s.lastDifficulty === 'hard' },
  { state: 'goodStreak', match: (s) => s.missionsLast7Days >= 2 && !s.atRisk },
  { state: 'default', match: () => true },
];

export function selectState(signals: Signals): ReactionState {
  for (const rule of STATE_PRIORITY) {
    if (rule.match(signals)) return rule.state;
  }
  return 'default';
}

function pickVariant(variants: readonly string[], variantIndex: number): string {
  if (variants.length === 0) return '';
  const i = ((variantIndex % variants.length) + variants.length) % variants.length;
  return variants[i];
}

// --- R3: celebración (spec §3) ---

// Disparadores en orden de prioridad: perfectWeek > consecutiveDays > threeInWeek.
function selectCelebration(signals: Signals): CelebrationTrigger | null {
  if (signals.missionsLast7Days >= 3 && !signals.overdueDebt && signals.noPenaltiesLast7Days) {
    return 'perfectWeek';
  }
  if (signals.consecutiveDays) return 'consecutiveDays';
  if (signals.missionsLast7Days >= 3) return 'threeInWeek';
  return null;
}

// --- A1: hitos (spec §4) ---

// Hito ALCANZADO hoy según las señales (independiente de si ya se mostró).
function reachedMilestones(signals: Signals): MilestoneId[] {
  const reached: MilestoneId[] = [];
  if (signals.daysTogether >= 7) reached.push('week1');
  if (signals.completedCount >= 10) reached.push('missions10');
  if (signals.daysTogether >= 30) reached.push('day30');
  if (signals.firstHardDone) reached.push('firstHard');
  if (signals.daysTogether >= 66) reached.push('day66');
  return reached;
}

// Primer hito alcanzado que NO esté ya en milestonesShown. null si no hay pendiente.
function selectMilestone(signals: Signals, shown: readonly string[]): MilestoneReaction | null {
  for (const id of reachedMilestones(signals)) {
    if (shown.includes(id)) continue;
    const copy = MILESTONE_COPY[id];
    return {
      id,
      line: copy.character,
      cupidoLine: copy.cupido,
      big: BIG_MILESTONES.includes(id),
    };
  }
  return null;
}

// --- Función principal ---

export function reactionFor(
  character: Character,
  missions: Mission[],
  today: string,
  opts: ReactionOpts = {},
): Reaction {
  const variantIndex = opts.variantIndex ?? 0;
  const signals = deriveSignals(character, missions, today);

  const state = selectState(signals);
  const stateCopy = STATE_COPY[state];
  const characterLine = pickVariant(stateCopy.character, variantIndex);

  let celebration: Celebration | null = null;
  if (opts.evaluateCelebration) {
    const trigger = selectCelebration(signals);
    if (trigger) {
      const cc = CELEBRATION_COPY[trigger];
      celebration = {
        trigger,
        characterLine: pickVariant(cc.character, variantIndex),
        cupidoLine: cc.cupido,
      };
    }
  }

  const milestone = selectMilestone(signals, character.milestonesShown);

  return {
    characterLine,
    cupidoLine: stateCopy.cupido,
    sprite: SPRITE[state],
    state,
    celebration,
    milestone,
  };
}
