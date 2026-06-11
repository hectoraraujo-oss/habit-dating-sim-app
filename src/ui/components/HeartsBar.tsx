// Barra de corazones: progreso DENTRO del nivel actual (mecanicas-detalle §2).
// En nivel 3 muestra "Consolidado" en lugar de barra.

import type { Character } from '../../types';
import { heartsToNextLevel } from '../../game/hearts';

interface HeartsBarProps {
  character: Character;
  atRisk?: boolean;
}

export function HeartsBar({ character, atRisk = false }: HeartsBarProps) {
  const progress = heartsToNextLevel(character.level, character.heartsTotal);

  if (!progress) {
    return <p className="text-sm font-semibold text-amber-600">✓ Hábito consolidado</p>;
  }

  const ratio = Math.min(1, Math.max(0, progress.current / progress.total));
  const barColor = atRisk ? 'bg-orange-500' : 'bg-pink-500';

  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-pink-200 bg-pink-100">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className={`mt-1 text-xs ${atRisk ? 'text-orange-600' : 'text-pink-600'}`}>
        💕 {progress.display} para Nivel {character.level + 1}
      </p>
    </div>
  );
}
