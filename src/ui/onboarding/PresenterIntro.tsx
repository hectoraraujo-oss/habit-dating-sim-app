// Secuencia de intro de Cupido: los 6 cuadros de flujo-y-guion §2, click para avanzar.
// "saltar intro ›" salta directo al tutorial (onDone), nunca se salta crear el primer
// hábito. Al pasar el último cuadro, onDone encadena al tutorial guiado.

import { useState } from 'react';
import { PresenterDialog } from '../components/PresenterDialog';
import { INTRO_FRAMES } from './script';

interface PresenterIntroProps {
  onDone: () => void;
}

export function PresenterIntro({ onDone }: PresenterIntroProps) {
  const [index, setIndex] = useState(0);
  const frame = INTRO_FRAMES[index];

  function advance() {
    if (index < INTRO_FRAMES.length - 1) {
      setIndex(index + 1);
    } else {
      onDone();
    }
  }

  return (
    <PresenterDialog pose={frame.pose} onAdvance={advance} onSkip={onDone}>
      {frame.text}
    </PresenterDialog>
  );
}
