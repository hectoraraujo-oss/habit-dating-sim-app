// Construcción pura de las escenas de apertura de la app (extraída de App.tsx para
// poder testearla — QA M1). Dos fuentes de escenas:
//
// 1. El check de abandono de ESTA apertura.
// 2. Re-hidratación: flags pendingAbandonmentScene/pendingCancellationScene que
//    quedaron en true de sesiones anteriores (la app se cerró durante la escena,
//    o se importó un respaldo con flags pendientes). Antes nadie los leía y la
//    consecuencia narrativa se perdía para siempre aunque la penalización ya
//    se había aplicado.
//
// Decisión P4 de Hector (2026-06-12) — derecho de réplica: las misiones vencidas ya NO se
// auto-fallan al abrir la app (antes checkExpiredMissions las pasaba a failed con
// penalización y escena). Quedan pendientes, visibles como "vencidas" en el Home, hasta que
// el usuario las resuelva en la Pantalla 4 ("Sí lo hice (tarde)" o "Aceptar la pérdida").
// Por eso buildStartup ya no genera escenas de cancelación por vencimiento: las escenas de
// cancelación de apertura solo pueden venir de flags re-hidratados.

import type { GameState, Mission } from '../types';
import { acknowledgeCancellationScene, checkAbandonment } from './engine';

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
  const abandonment = checkAbandonment(initial, today);
  let state = abandonment.state;

  // Escenas de los eventos detectados en esta apertura (solo abandono — ver nota P4 arriba)
  const startupScenes: StartupScene[] = abandonment.events.map((event) => ({
    kind: 'abandonment' as const,
    characterId: event.characterId,
  }));

  // Re-hidratación: flags que siguen en true y que el check de hoy NO encoló
  const queuedAbandonment = new Set(startupScenes.map((s) => s.characterId));

  for (const character of state.characters) {
    if (character.pendingAbandonmentScene && !queuedAbandonment.has(character.id)) {
      startupScenes.push({ kind: 'abandonment', characterId: character.id });
    }
    if (character.pendingCancellationScene) {
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
