// Modelo de datos del juego — ver docs/build/bubble-schema.md y docs/testing/qa-report.md.
//
// Convención de corazones (decisión de Hector, 2026-06-11 — alineada con bubble-schema.md):
// - heartsTotal es el ÚNICO contador. Sube al completar misiones y BAJA con penalizaciones
//   (cancelar / dejar vencer), con mínimo 0. El progreso hacia el siguiente nivel retrocede.
// - level es un campo independiente: sube al cruzar umbrales (20/60/140) y solo baja por
//   abandono (inactividad de 21 días) — nunca por penalizaciones de corazones.

export type Difficulty = 'easy' | 'medium' | 'hard';
export type CharacterStatus = 'active' | 'happy_ending' | 'abandoned';
export type MissionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type SlotNumber = 1 | 2 | 3;
export type Level = 0 | 1 | 2 | 3;

export interface Character {
  id: string;
  name: string;
  // null cuando el slot fue liberado (boda o abandono)
  slotNumber: SlotNumber | null;
  status: CharacterStatus;
  level: Level;
  heartsTotal: number;
  // Fecha ISO (YYYY-MM-DD)
  createdDate: string;
  lastMissionCompletedDate: string | null;
  // Ancla del reloj de abandono: arranca en createdDate, se reinicia al completar una misión
  // y avanza 21 días por cada bajada de nivel aplicada (el reloj nunca para — decisión de
  // Hector, 2026-06-11). lastMissionCompletedDate queda como dato histórico/visible.
  inactivitySince: string;
  pendingAbandonmentScene: boolean;
  pendingCancellationScene: boolean;
}

export interface Mission {
  id: string;
  characterId: string;
  name: string;
  difficulty: Difficulty;
  deadline: string;
  status: MissionStatus;
  completedDate: string | null;
  // Delta aplicado: +5/+10/+18 al completar, -3/-5/-8 al cancelar o vencer. null si pendiente.
  heartsAwarded: number | null;
}

export interface HappyEnding {
  id: string;
  characterName: string;
  originalCharacterId: string;
  weddingDate: string;
}

export interface GameState {
  schemaVersion: number;
  // true = el jugador ya pasó (o saltó) el onboarding alguna vez. Vive en la raíz, no en
  // Character: es un hecho de la partida, no de un personaje (un veterano puede quedarse sin
  // personajes y seguir siendo veterano). Default en createEmptyState: false. Compatibilidad:
  // un respaldo viejo sin el campo se normaliza a true al cargar (no se re-onboardea a quien
  // ya jugó) — ver normalizeLoaded en storage.ts. NO sube SCHEMA_VERSION.
  onboarded: boolean;
  characters: Character[];
  missions: Mission[];
  happyEndings: HappyEnding[];
}
