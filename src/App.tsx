// Raíz de la app: estado del juego + navegación entre las 7 pantallas.
// Al abrir corre los checks de vencimiento y abandono (equivalente al "page load
// del Home" de bubble-decisions) y encola las escenas pendientes. Cada cambio de
// estado se persiste en localStorage.

import { useEffect, useState } from 'react';
import type { Difficulty, GameState, Level } from './types';
import { todayIso } from './game/dates';
import {
  acknowledgeAbandonmentScene,
  acknowledgeCancellationScene,
  cancelMission,
  checkAbandonment,
  checkExpiredMissions,
  completeMission,
  createCharacter,
  createMission,
  deleteCharacter,
} from './game/engine';
import { loadState, saveState } from './storage';
import { HomeScreen } from './ui/screens/HomeScreen';
import { ProfileScreen } from './ui/screens/ProfileScreen';
import { CreateCharacterScreen } from './ui/screens/CreateCharacterScreen';
import { CreateMissionScreen } from './ui/screens/CreateMissionScreen';
import { CompleteMissionScreen } from './ui/screens/CompleteMissionScreen';
import { LevelScene } from './ui/screens/LevelScene';
import { AbandonmentScene } from './ui/screens/AbandonmentScene';
import { CancellationScene } from './ui/screens/CancellationScene';

type Screen =
  | { name: 'home' }
  | { name: 'profile'; characterId: string }
  | { name: 'create-character' }
  | { name: 'create-mission'; characterId: string; from: Screen }
  | { name: 'complete-mission'; missionId: string; from: Screen }
  | { name: 'level-scene'; characterId: string; newLevel: Level; wedding: boolean }
  | { name: 'cancellation-scene'; characterId: string; missionId: string; auto: boolean };

// Escenas detectadas al abrir la app, mostradas en secuencia antes del Home
type StartupScene =
  | { kind: 'abandonment'; characterId: string }
  | { kind: 'cancellation'; characterId: string; missionId: string };

interface InitResult {
  state: GameState;
  startupScenes: StartupScene[];
}

function initGame(today: string): InitResult {
  const expired = checkExpiredMissions(loadState(), today);
  const abandonment = checkAbandonment(expired.state, today);
  const startupScenes: StartupScene[] = [
    ...abandonment.events.map((event) => ({ kind: 'abandonment' as const, characterId: event.characterId })),
    ...expired.expiredMissionIds.map((missionId) => {
      const mission = abandonment.state.missions.find((m) => m.id === missionId);
      return { kind: 'cancellation' as const, characterId: mission?.characterId ?? '', missionId };
    }),
  ];
  return { state: abandonment.state, startupScenes };
}

export default function App() {
  const today = todayIso();
  const [init] = useState(() => initGame(today));
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
    const result = createMission(state, characterId, name, difficulty, deadline);
    if (!result.ok) {
      setToast('No se pudo crear la misión.');
      return;
    }
    setState(result.state);
    setScreen({ name: 'home' });
    setToast('Misión creada 💌');
  }

  function handleCompleteMission(missionId: string) {
    const result = completeMission(state, missionId, today);
    if (result.kind === 'invalid') {
      setToast('Esta misión ya no está pendiente.');
      setScreen({ name: 'home' });
      return;
    }
    if (result.kind === 'expired') {
      const mission = result.state.missions.find((m) => m.id === missionId);
      setState(result.state);
      setScreen({
        name: 'cancellation-scene',
        characterId: mission?.characterId ?? '',
        missionId,
        auto: true,
      });
      return;
    }
    const mission = result.state.missions.find((m) => m.id === missionId);
    setState(result.state);
    if (result.leveledUp && mission) {
      setScreen({
        name: 'level-scene',
        characterId: mission.characterId,
        newLevel: result.newLevel,
        wedding: result.wedding,
      });
    } else {
      setScreen({ name: 'home' });
      setToast(`¡Misión completada! +${result.heartsEarned} 💕`);
    }
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
            onOpenProfile={(characterId) => setScreen({ name: 'profile', characterId })}
            onCreateCharacter={() => setScreen({ name: 'create-character' })}
            onCreateMission={(characterId) =>
              setScreen({ name: 'create-mission', characterId, from: { name: 'home' } })
            }
            onOpenMission={(missionId) =>
              setScreen({ name: 'complete-mission', missionId, from: { name: 'home' } })
            }
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
