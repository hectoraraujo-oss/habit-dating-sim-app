// Constantes del sistema — ver docs/design/mecanicas-detalle.md §8.

import type { Difficulty, SlotNumber } from '../types';

export const HEARTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 18,
};

// Magnitud de la penalización por cancelar o dejar vencer una misión (se aplica como resta).
export const CANCEL_PENALTY: Record<Difficulty, number> = {
  easy: 3,
  medium: 5,
  hard: 8,
};

// heartsTotal acumulado necesario para alcanzar cada nivel (índice = nivel).
export const LEVEL_THRESHOLDS = [0, 20, 60, 140] as const;
export const MAX_LEVEL = 3;

export const ABANDONMENT_DAYS = 21;
export const AT_RISK_DAYS = 14;
export const MAX_CHARACTERS = 3;
export const MAX_PENDING_MISSIONS_PER_CHARACTER = 3;

export const SLOT_NUMBERS: readonly SlotNumber[] = [1, 2, 3];

export const SCHEMA_VERSION = 1;
