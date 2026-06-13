// Tutorial guiado, paso "crear primera misión": envuelve la pantalla REAL
// CreateMissionScreen con la franja de Cupido. Copy EXACTO de flujo-y-guion §3. Cupido
// reacciona al campo que toca el usuario (nombre -> dificultad -> fecha -> recompensa). El
// paso solo avanza, nunca retrocede. "Cancelar" oculto durante el tutorial.

import { useState } from 'react';
import type { Character, Difficulty, GameState } from '../../types';
import {
  CreateMissionScreen,
  type MissionTutorialStep,
} from '../screens/CreateMissionScreen';
import { CoachStrip } from './CoachStrip';
import type { CupidoPose } from '../components/Cupido';

interface TutorialCreateMissionProps {
  state: GameState;
  character: Character;
  today: string;
  onConfirm: (name: string, difficulty: Difficulty, deadline: string) => void;
}

const STEP_ORDER: MissionTutorialStep[] = ['name', 'difficulty', 'deadline', 'reward'];

function coachFor(step: MissionTutorialStep, name: string): { pose: CupidoPose; text: string } {
  switch (step) {
    case 'name':
      return {
        pose: 'explicar',
        text: `Una misión es un acto concreto de amor por ${name}. Sé específic@: la pasión está en los detalles. ¿Qué harás?`,
      };
    case 'difficulty':
      return {
        pose: 'explicar',
        text: '¿Qué tan difícil? Sé honest@, te lo ruego: lo difícil da más amor, pero solo si de verdad cumples.',
      };
    case 'deadline':
      return {
        pose: 'serena',
        text: '¿Para cuándo? Puede ser hoy mismo. Elige una fecha que tu corazón pueda honrar.',
      };
    case 'reward':
      return {
        pose: 'corazon',
        text: '¿Ves esos corazones? Es el amor que te espera. Y sí, cambiar la fecha después duele. ¡Promete solo lo que sientas de verdad!',
      };
  }
}

export function TutorialCreateMission({
  state,
  character,
  today,
  onConfirm,
}: TutorialCreateMissionProps) {
  const [step, setStep] = useState<MissionTutorialStep>('name');

  // El tutorial solo avanza: si el usuario vuelve a un campo anterior, Cupido no retrocede.
  function advanceTo(next: MissionTutorialStep) {
    setStep((current) => (STEP_ORDER.indexOf(next) > STEP_ORDER.indexOf(current) ? next : current));
  }

  const coach = coachFor(step, character.name);

  return (
    <>
      <CreateMissionScreen
        state={state}
        character={character}
        today={today}
        tutorial
        onConfirm={onConfirm}
        onCancel={() => {}}
        onTutorialStep={advanceTo}
      />
      <CoachStrip pose={coach.pose} text={coach.text} />
    </>
  );
}
