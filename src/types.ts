// Modelo de datos del juego — ver docs/build/bubble-schema.md y docs/testing/qa-report.md.
//
// Convención de corazones (de qa-report.md):
// - heartsTotal: acumulador de nivel. Solo sube. Decide las subidas de nivel.
// - heartsCurrent: contador visible. Baja con penalizaciones (clamp a 0), sube al completar.
// El nivel es un campo independiente: sube al cruzar umbrales y solo baja por abandono.

export type Difficulty = 'easy' | 'medium' | 'hard';
export type CharacterStatus = 'active' | 'happy_ending' | 'abandoned';
export type MissionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type SlotNumber = 1 | 2 | 3;
export type Level = 0 | 1 | 2 | 3;

export interface Character {
  id: string;
  name: string;
  // null cuando el slot fue liberado (boda o abandono en nivel 0)
  slotNumber: SlotNumber | null;
  status: CharacterStatus;
  level: Level;
  heartsTotal: number;
  heartsCurrent: number;
  // Fecha ISO (YYYY-MM-DD). Si nunca completó una misión, la inactividad se cuenta desde aquí.
  createdDate: string;
  lastMissionCompletedDate: string | null;
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
  characters: Character[];
  missions: Mission[];
  happyEndings: HappyEnding[];
}
