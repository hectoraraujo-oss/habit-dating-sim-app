// Cálculo de corazones y niveles — ver docs/design/mecanicas-detalle.md §9.

import type { Difficulty, Level } from '../types';
import { HEARTS_BY_DIFFICULTY, LEVEL_THRESHOLDS, MAX_LEVEL } from './constants';
import { daysBetween } from './dates';

// Multiplicador por retraso (mecanicas-detalle §4): 1-3 días = 75%, 4-7 = 50%, 8+ = 25%.
// Desde la decisión P4 de Hector (2026-06-12, derecho de réplica) este multiplicador SÍ
// aplica en el flujo real: una misión vencida puede completarse tarde ("Sí lo hice (tarde)")
// con la recompensa reducida. No hay ventana límite: el piso es 25% sin importar el retraso.
export function lateMultiplier(daysLate: number): number {
  if (daysLate <= 0) return 1;
  if (daysLate <= 3) return 0.75;
  if (daysLate <= 7) return 0.5;
  return 0.25;
}

export function calcHeartsEarned(
  difficulty: Difficulty,
  deadline: string,
  completedDate: string,
): number {
  const daysLate = Math.max(0, daysBetween(deadline, completedDate));
  return Math.ceil(HEARTS_BY_DIFFICULTY[difficulty] * lateMultiplier(daysLate));
}

export function levelForHearts(heartsTotal: number): Level {
  let level: Level = 0;
  for (const next of [1, 2, 3] as const) {
    if (heartsTotal >= LEVEL_THRESHOLDS[next]) level = next;
  }
  return level;
}

export interface LevelProgress {
  current: number;
  total: number;
  display: string;
}

// Progreso dentro del nivel actual para la barra de corazones. null si ya está en nivel máximo.
// `current` se ACOTA a [0, total] solo para PRESENTACIÓN (fix QA M2): heartsTotal puede caer
// debajo del piso del nivel (deuda por penalizaciones, nivel no baja: decisión M-2026-06-11-A)
// o quedar por encima del techo (bajó de nivel con corazones intactos, TC-042), y sin clamp la
// barra mostraba "-20/40" o "55/40". No toca heartsTotal real ni la lógica de niveles.
export function heartsToNextLevel(level: Level, heartsTotal: number): LevelProgress | null {
  if (level >= MAX_LEVEL) return null;
  const levelFloor = LEVEL_THRESHOLDS[level];
  const total = LEVEL_THRESHOLDS[level + 1] - levelFloor;
  const current = Math.min(total, Math.max(0, heartsTotal - levelFloor));
  return { current, total, display: `${current}/${total}` };
}
