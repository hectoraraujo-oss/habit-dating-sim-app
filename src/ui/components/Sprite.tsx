import type { Character } from '../../types';
import { spriteFor } from '../sprites';

interface SpriteProps {
  character: Character;
  size?: number;
  sad?: boolean;
  // Suspiro idle lento y melancólico (at-risk, dirección-visual.md §5). NO es shake de
  // alarma: translateY 0->2px + opacity sutil en 4s. Colapsa con prefers-reduced-motion.
  sigh?: boolean;
  // Respiración idle en REPOSO (dirección-visual.md §6 + §2 principio 3): breathe muy sutil
  // (scale 1->1.015, 4s) que da vida sin distraer. Solo se aplica en estado normal: NO debe
  // convivir con `sigh` (tristeza del at-risk) ni con un pop de celebración. Por seguridad,
  // si `sigh` está activo el idle se ignora (gana la tristeza). Colapsa con prefers-reduced-motion.
  idle?: boolean;
}

// Placeholder de sprite pixel-art. La versión "triste" (en riesgo / escenas de
// penalización) se simula con escala de grises hasta tener assets dedicados.
export function Sprite({
  character,
  size = 96,
  sad = false,
  sigh = false,
  idle = false,
}: SpriteProps) {
  // El suspiro triste (at-risk) tiene prioridad sobre la respiración idle: nunca corren juntos.
  const motionClass = sigh ? 'animate-sigh' : idle ? 'animate-idle-breathe' : '';
  return (
    <img
      src={spriteFor(character)}
      alt={character.name}
      width={size}
      height={size}
      className={`${sad ? 'opacity-80 grayscale' : ''} ${motionClass}`.trim()}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
