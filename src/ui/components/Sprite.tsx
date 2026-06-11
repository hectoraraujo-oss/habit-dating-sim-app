import type { Character } from '../../types';
import { spriteFor } from '../sprites';

interface SpriteProps {
  character: Character;
  size?: number;
  sad?: boolean;
}

// Placeholder de sprite pixel-art. La versión "triste" (en riesgo / escenas de
// penalización) se simula con escala de grises hasta tener assets dedicados.
export function Sprite({ character, size = 96, sad = false }: SpriteProps) {
  return (
    <img
      src={spriteFor(character)}
      alt={character.name}
      width={size}
      height={size}
      className={sad ? 'opacity-80 grayscale' : ''}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
