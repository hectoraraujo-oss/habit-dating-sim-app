// Tutorial guiado, paso "crear personaje": envuelve la pantalla REAL CreateCharacterScreen
// con la franja de Cupido (CoachStrip). Copy EXACTO de flujo-y-guion §3. Cupido reacciona al
// nombre que se escribe. "Cancelar" queda oculto (tutorial), el campo nombre va resaltado.

import { useState } from 'react';
import { CreateCharacterScreen } from '../screens/CreateCharacterScreen';
import { CoachStrip } from './CoachStrip';

interface TutorialCreateCharacterProps {
  onConfirm: (name: string) => void;
}

export function TutorialCreateCharacter({ onConfirm }: TutorialCreateCharacterProps) {
  const [name, setName] = useState('');
  const typed = name.trim();

  const text = typed
    ? `¡${typed}! Un nombre precioso. En cuanto confirmes, se mudará a una de tus tres habitaciones.`
    : '¡El momento ha llegado! Escribe el hábito que anhelas. Lo que escribas será su nombre, su identidad, su alma.';

  return (
    <>
      <CreateCharacterScreen
        tutorial
        onConfirm={onConfirm}
        onCancel={() => {}}
        onNameChange={setName}
      />
      <CoachStrip pose={typed ? 'corazon' : 'explicar'} text={text} />
    </>
  );
}
