// Construcción pura de las escenas de apertura de la app (extraída de App.tsx para
// poder testearla — QA M1). Dos fuentes de escenas:
//
// 1. Los checks de ESTA apertura (misiones vencidas + abandono), como siempre.
// 2. Re-hidratación: flags pendingAbandonmentScene/pendingCancellationScene que
//    quedaron en true de sesiones anteriores (la app se cerró durante la escena,
//    o se importó un respaldo con flags pendientes). Antes nadie los leía y la
//    consecuencia narrativa se perdía para siempre aunque la penalización ya
//    se había aplicado.

import type { GameState, Mission } from '../types';
import { acknowledgeCancellationScene, checkAbandonment, checkExpiredMissions } from './engine';

export type StartupScene =
  | { kind: 'abandonment'; characterId: string }
  | { kind: 'cancellation'; characterId: string; missionId: string };

export interface StartupResult {
  state: GameState;
  startupScenes: StartupScene[];
}

// La misión failed/cancelled más reciente del personaje. Para una escena de
// cancelación re-hidratada no se conoce el missionId original (no se persiste),
// así que se usa la última cerrada como referencia narrativa. Las misiones se
// agregan al final del array, así que se recorre de atrás hacia adelante.
function latestClosedMission(state: GameState, characterId: string): Mission | undefined {
  for (let i = state.missions.length - 1; i >= 0; i--) {
    const mission = state.missions[i];
    if (mission.characterId === characterId && (mission.status === 'failed' || mission.status === 'cancelled')) {
      return mission;
    }
  }
  return undefined;
}

export function buildStartup(initial: GameState, today: string): StartupResult {
  const expired = checkExpiredMissions(initial, today);
  const abandonment = checkAbandonment(expired.state, today);
  let state = abandonment.state;

  // Escenas de los eventos detectados en esta apertura
  const startupScenes: StartupScene[] = [
    ...abandonment.events.map((event) => ({ kind: 'abandonment' as const, characterId: event.characterId })),
    ...expired.expiredMissionIds.flatMap((missionId) => {
      const mission = state.missions.find((m) => m.id === missionId);
      return mission
        ? [{ kind: 'cancellation' as const, characterId: mission.characterId, missionId }]
        : [];
    }),
  ];

  // Re-hidratación: flags que siguen en true y que los checks de hoy NO encolaron
  const queuedAbandonment = new Set(
    startupScenes.filter((s) => s.kind === 'abandonment').map((s) => s.characterId),
  );
  const queuedCancellation = new Set(
    startupScenes.filter((s) => s.kind === 'cancellation').map((s) => s.characterId),
  );

  for (const character of state.characters) {
    if (character.pendingAbandonmentScene && !queuedAbandonment.has(character.id)) {
      startupScenes.push({ kind: 'abandonment', characterId: character.id });
    }
    if (character.pendingCancellationScene && !queuedCancellation.has(character.id)) {
      const mission = latestClosedMission(state, character.id);
      if (mission) {
        startupScenes.push({ kind: 'cancellation', characterId: character.id, missionId: mission.id });
      } else {
        // Flag huérfano sin misión que mostrar (p. ej. respaldo editado): se limpia
        // sin escena para no dejar una pantalla rota ni un flag en true para siempre.
        state = acknowledgeCancellationScene(state, character.id);
      }
    }
  }

  return { state, startupScenes };
}
