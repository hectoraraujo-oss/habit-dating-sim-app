// Raíz de la app: estado del juego + navegación entre las 7 pantallas.
// Al abrir corre el check de abandono (equivalente al "page load del Home" de
// bubble-decisions) y encola las escenas pendientes — incluidas las que quedaron sin
// reconocer de sesiones anteriores (buildStartup, QA M1). Las misiones vencidas ya no
// se auto-fallan al abrir (decisión P4 de Hector, 2026-06-12: derecho de réplica).
// Cada cambio de estado se persiste en localStorage.

import { useEffect, useState } from 'react';
import type { Difficulty, GameState, Level } from './types';
import { todayIso } from './game/dates';
import {
  acceptMissionLoss,
  acknowledgeAbandonmentScene,
  acknowledgeCancellationScene,
  acknowledgeMilestone,
  cancelMission,
  completeMission,
  createCharacter,
  createMission,
  deleteCharacter,
} from './game/engine';
import { reactionFor, type Celebration, type MilestoneReaction } from './game/reaction';
import { buildStartup, type StartupScene } from './game/startup';
import { loadState, saveState } from './storage';
import { StartScreen } from './ui/screens/StartScreen';
import { OnboardingFlow } from './ui/onboarding/OnboardingFlow';
import { HomeScreen } from './ui/screens/HomeScreen';
import { ProfileScreen } from './ui/screens/ProfileScreen';
import { CreateCharacterScreen } from './ui/screens/CreateCharacterScreen';
import { CreateMissionScreen } from './ui/screens/CreateMissionScreen';
import { CompleteMissionScreen } from './ui/screens/CompleteMissionScreen';
import { LevelScene } from './ui/screens/LevelScene';
import { AbandonmentScene } from './ui/screens/AbandonmentScene';
import { CancellationScene } from './ui/screens/CancellationScene';
import { DataScreen } from './ui/screens/DataScreen';
import { MissionResultScreen } from './ui/screens/MissionResultScreen';

type Screen =
  | { name: 'home' }
  | { name: 'profile'; characterId: string }
  | { name: 'create-character' }
  | { name: 'create-mission'; characterId: string; from: Screen }
  | { name: 'complete-mission'; missionId: string; from: Screen }
  | { name: 'level-scene'; characterId: string; newLevel: Level; wedding: boolean }
  | {
      name: 'mission-result';
      characterId: string;
      heartsEarned: number;
      celebration: Celebration | null;
      milestone: MilestoneReaction | null;
    }
  | { name: 'cancellation-scene'; characterId: string; missionId: string; auto: boolean }
  | { name: 'data' };

// Modo del gate de inicio (P7-a). Vive ANTES de la máquina de escenas (Riesgo R1 de la
// spec): si la partida no está onboardeada, ni siquiera se construye buildStartup.
type GateMode =
  | { name: 'start' } // pantalla de inicio (Iniciar / Cargar partida)
  | { name: 'onboarding'; initialState: GameState } // flujo del presentador
  | { name: 'game'; initialState: GameState }; // partida onboardeada: flujo normal

export default function App() {
  const today = todayIso();
  // Decisión "pantalla de inicio vs Home" según state.onboarded. loadState ya normalizó el
  // campo (respaldo viejo -> true). Una partida nueva nace con onboarded:false.
  const [gate, setGate] = useState<GateMode>(() => {
    const loaded = loadState();
    return loaded.onboarded ? { name: 'game', initialState: loaded } : { name: 'start' };
  });

  if (gate.name === 'start') {
    return (
      <StartScreen
        onStart={() => {
          // El flag se compromete al INICIAR, no al terminar (decisión §2): si el usuario
          // cierra a media intro no vuelve a la pantalla de inicio (cae a Home vacío).
          const fresh: GameState = { ...loadState(), onboarded: true };
          saveState(fresh);
          setGate({ name: 'onboarding', initialState: fresh });
        }}
        onLoad={(loaded) => {
          // Cargar archivo SIEMPRE omite el onboarding (P7): se fuerza onboarded:true y se
          // entra al flujo normal (buildStartup -> escenas -> Home).
          const imported: GameState = { ...loaded, onboarded: true };
          saveState(imported);
          setGate({ name: 'game', initialState: imported });
        }}
      />
    );
  }

  if (gate.name === 'onboarding') {
    return (
      <OnboardingFlow
        initialState={gate.initialState}
        today={today}
        onFinish={(finalState) => {
          saveState(finalState);
          setGate({ name: 'game', initialState: finalState });
        }}
      />
    );
  }

  return <Game initialState={gate.initialState} today={today} />;
}

// Partida onboardeada: corre buildStartup y la máquina de escenas + las 7 pantallas.
// Recibe initialState ya onboardeado, así que la máquina de escenas nunca evalúa un estado
// nuevo (Riesgo R1). Es el flujo que existía antes del gate, intacto.
function Game({ initialState, today }: { initialState: GameState; today: string }) {
  // Escenas de apertura (checks de hoy + flags pendientes de sesiones anteriores),
  // mostradas en secuencia antes del Home. Lógica pura en src/game/startup.ts.
  const [init] = useState(() => buildStartup(initialState, today));
  const [state, setState] = useState<GameState>(init.state);
  const [startupScenes, setStartupScenes] = useState<StartupScene[]>(init.startupScenes);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function findCharacter(id: string) {
    return state.characters.find((c) => c.id === id);
  }

  function findMission(id: string) {
    return state.missions.find((m) => m.id === id);
  }

  function handleConfirmCharacter(name: string) {
    const result = createCharacter(state, name, today);
    if (!result.ok) {
      setToast('Las 3 habitaciones están ocupadas.');
      return;
    }
    setState(result.state);
    setScreen({ name: 'home' });
    setToast(`${name} se mudó a la habitación ${result.character.slotNumber} 💌`);
  }

  function handleConfirmMission(characterId: string, name: string, difficulty: Difficulty, deadline: string) {
    const result = createMission(state, characterId, name, difficulty, deadline, today);
    if (!result.ok) {
      setToast('No se pudo crear la misión.');
      return;
    }
    setState(result.state);
    setScreen({ name: 'home' });
    setToast('Misión creada 💌');
  }

  // P4 (2026-06-12): completar también aplica a misiones vencidas ("Sí lo hice (tarde)",
  // con recompensa reducida por el multiplicador de retraso). El camino de "Aceptar la
  // pérdida" es handleAcceptLoss.
  function handleCompleteMission(missionId: string) {
    const result = completeMission(state, missionId, today);
    if (result.kind === 'invalid') {
      setToast('Esta misión ya no está pendiente.');
      setScreen({ name: 'home' });
      return;
    }
    const mission = result.state.missions.find((m) => m.id === missionId);
    setState(result.state);

    // Subida de nivel: la LevelScene es su propia celebración inmersiva (no se mezcla con
    // R3/A1 para no saturar — un solo Cupido por evento, P7-b).
    if (result.leveledUp && mission) {
      setScreen({
        name: 'level-scene',
        characterId: mission.characterId,
        newLevel: result.newLevel,
        wedding: result.wedding,
      });
      return;
    }

    // Motor de reactividad (P8-a): sobre el estado YA actualizado, evalúa R3 (celebración
    // de frecuencia) y A1 (hito pendiente). Si hay algo que mostrar, va a la pantalla de
    // resultado (+💕 → celebración del personaje → cuadro de Cupido del hito). Si no, el
    // toast de siempre.
    const character = mission ? result.state.characters.find((c) => c.id === mission.characterId) : undefined;
    if (mission && character) {
      const reaction = reactionFor(character, result.state.missions, today, {
        evaluateCelebration: true,
        variantIndex: result.state.missions.length,
      });
      if (reaction.celebration || reaction.milestone) {
        setScreen({
          name: 'mission-result',
          characterId: character.id,
          heartsEarned: result.heartsEarned,
          celebration: reaction.celebration,
          milestone: reaction.milestone,
        });
        return;
      }
    }

    setScreen({ name: 'home' });
    setToast(`¡Misión completada! +${result.heartsEarned} 💕`);
  }

  // A1: persistir un hito como mostrado (idempotente) para que no se repita.
  function handleAcknowledgeMilestone(characterId: string, milestoneId: string) {
    setState((prev) => acknowledgeMilestone(prev, characterId, milestoneId));
  }

  // Abrir el Perfil (spec §5: el hito también se evalúa al abrir el Perfil, por si se cruzó
  // por el paso del tiempo, ej. día 30 sin haber cumplido ese día). Si hay un hito pendiente,
  // se muestra primero como resultado (sin +💕 ni celebración: no hubo misión); luego el Perfil.
  function handleOpenProfile(characterId: string) {
    const character = findCharacter(characterId);
    if (character) {
      const reaction = reactionFor(character, state.missions, today);
      if (reaction.milestone) {
        setScreen({
          name: 'mission-result',
          characterId,
          heartsEarned: 0,
          celebration: null,
          milestone: reaction.milestone,
        });
        return;
      }
    }
    setScreen({ name: 'profile', characterId });
  }

  function handleDeleteCharacter(characterId: string) {
    const character = findCharacter(characterId);
    const result = deleteCharacter(state, characterId);
    if (!result.ok) {
      setScreen({ name: 'home' });
      return;
    }
    setState(result.state);
    setScreen({ name: 'home' });
    setToast(character ? `${character.name} fue eliminado.` : 'Personaje eliminado.');
  }

  // P4: "Aceptar la pérdida" de una misión vencida — failed + penalización + escena de
  // cancelación (lo que antes hacía automáticamente el check de apertura).
  function handleAcceptLoss(missionId: string) {
    const mission = findMission(missionId);
    const result = acceptMissionLoss(state, missionId);
    if (!result.ok || !mission) {
      setToast('Esta misión ya no está pendiente.');
      setScreen({ name: 'home' });
      return;
    }
    setState(result.state);
    setScreen({ name: 'cancellation-scene', characterId: mission.characterId, missionId, auto: true });
  }

  function handleCancelMission(missionId: string) {
    const mission = findMission(missionId);
    const result = cancelMission(state, missionId);
    if (!result.ok || !mission) {
      setToast('Esta misión ya no está pendiente.');
      setScreen({ name: 'home' });
      return;
    }
    setState(result.state);
    setScreen({ name: 'cancellation-scene', characterId: mission.characterId, missionId, auto: false });
  }

  function handleImportState(imported: GameState) {
    setState(imported);
    setScreen({ name: 'home' });
    setToast('Respaldo importado 💾');
  }

  function closeCancellationScene(characterId: string) {
    setState(acknowledgeCancellationScene(state, characterId));
    setScreen({ name: 'home' });
  }

  function closeStartupScene(scene: StartupScene) {
    setState(
      scene.kind === 'abandonment'
        ? acknowledgeAbandonmentScene(state, scene.characterId)
        : acknowledgeCancellationScene(state, scene.characterId),
    );
    setStartupScenes(startupScenes.slice(1));
  }

  // --- Render: primero las escenas de apertura, luego la pantalla actual ---

  const startupScene = startupScenes[0];
  if (startupScene) {
    const character = findCharacter(startupScene.characterId);
    if (!character) {
      return null;
    }
    if (startupScene.kind === 'abandonment') {
      return (
        <AbandonmentScene
          state={state}
          character={character}
          today={today}
          onClose={() => closeStartupScene(startupScene)}
        />
      );
    }
    const mission = findMission(startupScene.missionId);
    return mission ? (
      <CancellationScene
        character={character}
        mission={mission}
        auto
        onClose={() => closeStartupScene(startupScene)}
      />
    ) : null;
  }

  switch (screen.name) {
    case 'home':
      return (
        <>
          <HomeScreen
            state={state}
            today={today}
            onOpenProfile={handleOpenProfile}
            onCreateCharacter={() => setScreen({ name: 'create-character' })}
            onCreateMission={(characterId) =>
              setScreen({ name: 'create-mission', characterId, from: { name: 'home' } })
            }
            onOpenMission={(missionId) =>
              setScreen({ name: 'complete-mission', missionId, from: { name: 'home' } })
            }
            onOpenData={() => setScreen({ name: 'data' })}
          />
          {toast && <Toast message={toast} />}
        </>
      );

    case 'profile': {
      const character = findCharacter(screen.characterId);
      if (!character) {
        return null;
      }
      return (
        <ProfileScreen
          state={state}
          character={character}
          today={today}
          onBack={() => setScreen({ name: 'home' })}
          onCreateMission={() =>
            setScreen({ name: 'create-mission', characterId: character.id, from: screen })
          }
          onOpenMission={(missionId) => setScreen({ name: 'complete-mission', missionId, from: screen })}
          onDeleteCharacter={() => handleDeleteCharacter(character.id)}
        />
      );
    }

    case 'create-character':
      return (
        <CreateCharacterScreen
          onConfirm={handleConfirmCharacter}
          onCancel={() => setScreen({ name: 'home' })}
        />
      );

    case 'create-mission': {
      const character = findCharacter(screen.characterId);
      if (!character) {
        return null;
      }
      return (
        <CreateMissionScreen
          state={state}
          character={character}
          today={today}
          onConfirm={(name, difficulty, deadline) =>
            handleConfirmMission(character.id, name, difficulty, deadline)
          }
          onCancel={() => setScreen(screen.from)}
        />
      );
    }

    case 'complete-mission': {
      const mission = findMission(screen.missionId);
      const character = mission ? findCharacter(mission.characterId) : undefined;
      if (!mission || !character || mission.status !== 'pending') {
        return null;
      }
      return (
        <CompleteMissionScreen
          mission={mission}
          character={character}
          today={today}
          onComplete={() => handleCompleteMission(mission.id)}
          onAcceptLoss={() => handleAcceptLoss(mission.id)}
          onCancelMission={() => handleCancelMission(mission.id)}
          onBack={() => setScreen(screen.from)}
        />
      );
    }

    case 'level-scene': {
      const character = findCharacter(screen.characterId);
      if (!character) {
        return null;
      }
      return (
        <LevelScene
          state={state}
          character={character}
          newLevel={screen.newLevel}
          wedding={screen.wedding}
          today={today}
          onContinue={() => setScreen({ name: 'home' })}
        />
      );
    }

    case 'data':
      return (
        <DataScreen
          state={state}
          today={today}
          onImport={handleImportState}
          onBack={() => setScreen({ name: 'home' })}
        />
      );

    case 'mission-result': {
      const character = findCharacter(screen.characterId);
      if (!character) {
        return null;
      }
      return (
        <MissionResultScreen
          character={character}
          heartsEarned={screen.heartsEarned}
          celebration={screen.celebration}
          milestone={screen.milestone}
          onAcknowledgeMilestone={(milestoneId) =>
            handleAcknowledgeMilestone(character.id, milestoneId)
          }
          onContinue={() => setScreen({ name: 'profile', characterId: character.id })}
        />
      );
    }

    case 'cancellation-scene': {
      const character = findCharacter(screen.characterId);
      const mission = findMission(screen.missionId);
      if (!character || !mission) {
        return null;
      }
      return (
        <CancellationScene
          character={character}
          mission={mission}
          auto={screen.auto}
          onClose={() => closeCancellationScene(character.id)}
        />
      );
    }
  }
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-stone-800 px-4 py-2 text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  );
}
