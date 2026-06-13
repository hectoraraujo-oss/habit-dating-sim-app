// Orquestador del flujo del presentador (Bloques 2-3 del onboarding).
// Fases: intro (6 cuadros) -> crear personaje (tutorial) -> cuadro puente -> crear primera
// misión (tutorial) -> handoff -> Home. Crea de verdad el personaje y su misión en el
// estado y entrega el estado final al terminar (onFinish), para caer al Home con 1
// personaje + 1 misión, SIN pasar por la máquina de escenas (una partida nueva no tiene
// nada que checar — Riesgo R1 de la spec).

import { useState } from 'react';
import type { Difficulty, GameState } from '../../types';
import { createCharacter, createMission } from '../../game/engine';
import { PresenterDialog } from '../components/PresenterDialog';
import { PresenterIntro } from './PresenterIntro';
import { TutorialCreateCharacter } from './TutorialCreateCharacter';
import { TutorialCreateMission } from './TutorialCreateMission';
import { HANDOFF_FRAME } from './script';

interface OnboardingFlowProps {
  // Estado de arranque: una partida nueva con onboarded ya marcado en true (App lo marca
  // al iniciar, no al terminar — decisión §2 de la spec).
  initialState: GameState;
  today: string;
  // Se llama al tocar "Empezar" en el handoff: entrega el estado final (1 personaje + 1
  // misión) para que App caiga al Home.
  onFinish: (state: GameState) => void;
}

type Phase =
  | { name: 'intro' }
  | { name: 'create-character' }
  | { name: 'bridge'; characterId: string }
  | { name: 'create-mission'; characterId: string }
  | { name: 'handoff' };

export function OnboardingFlow({ initialState, today, onFinish }: OnboardingFlowProps) {
  const [state, setState] = useState<GameState>(initialState);
  const [phase, setPhase] = useState<Phase>({ name: 'intro' });

  function handleCharacterConfirmed(name: string) {
    const result = createCharacter(state, name, today);
    // En el tutorial las 3 habitaciones siempre están libres (partida nueva), así que
    // createCharacter no puede fallar; el guard es defensivo.
    if (!result.ok) return;
    setState(result.state);
    setPhase({ name: 'bridge', characterId: result.character.id });
  }

  function handleMissionConfirmed(
    characterId: string,
    name: string,
    difficulty: Difficulty,
    deadline: string,
  ) {
    const result = createMission(state, characterId, name, difficulty, deadline, today);
    if (!result.ok) return;
    setState(result.state);
    setPhase({ name: 'handoff' });
  }

  switch (phase.name) {
    case 'intro':
      return <PresenterIntro onDone={() => setPhase({ name: 'create-character' })} />;

    case 'create-character':
      return <TutorialCreateCharacter onConfirm={handleCharacterConfirmed} />;

    case 'bridge': {
      const character = state.characters.find((c) => c.id === phase.characterId);
      const name = character?.name ?? '';
      return (
        <PresenterDialog
          pose="corazon"
          onAdvance={() => setPhase({ name: 'create-mission', characterId: phase.characterId })}
        >
          {`${name} ya vive contigo. Pero ay… el amor no se sostiene con buenas intenciones. ¡Se sostiene con actos! Dale el primero.`}
        </PresenterDialog>
      );
    }

    case 'create-mission': {
      const character = state.characters.find((c) => c.id === phase.characterId);
      if (!character) return null;
      return (
        <TutorialCreateMission
          state={state}
          character={character}
          today={today}
          onConfirm={(name, difficulty, deadline) =>
            handleMissionConfirmed(character.id, name, difficulty, deadline)
          }
        />
      );
    }

    case 'handoff':
      return (
        <PresenterDialog pose={HANDOFF_FRAME.pose} onAdvance={() => onFinish(state)} cta="Empezar">
          {HANDOFF_FRAME.text}
        </PresenterDialog>
      );
  }
}
