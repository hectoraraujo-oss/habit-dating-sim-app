import type { Character } from '../../types';
import { spriteFor } from '../sprites';

interface SpriteProps {
  character: Character;
  size?: number;
  sad?: boolean;
  // Suspiro idle lento y melancólico (at-risk, dirección-visual.md §5). NO es shake de
  // alarma: translateY 0->2px + opacity sutil en 4s. Colapsa con prefers-reduced-motion.
  sigh?: boolean;
}

// Placeholder de sprite pixel-art. La versión "triste" (en riesgo / escenas de
// penalización) se simula con escala de grises hasta tener assets dedicados.
export function Sprite({ character, size = 96, sad = false, sigh = false }: SpriteProps) {
  return (
    <img
      src={spriteFor(character)}
      alt={character.name}
      width={size}
      height={size}
      className={`${sad ? 'opacity-80 grayscale' : ''} ${sigh ? 'animate-sigh' : ''}`.trim()}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
