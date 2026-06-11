// Asignación de placeholders de sprite/escena (docs/assets/placeholders/).
// El sprite se deriva del id del personaje (hash estable) — el Character no guarda
// sprite_id en el schema actual; cuando haya personalización de sprites (backlog)
// se agregará el campo.

import type { Character, Level } from '../types';
import personaje1 from '../assets/personaje-1.png';
import personaje2 from '../assets/personaje-2.png';
import personaje3 from '../assets/personaje-3.png';
import escenaNivel1 from '../assets/escena-nivel-1.png';
import escenaNivel2 from '../assets/escena-nivel-2.png';
import escenaNivel3 from '../assets/escena-nivel-3.png';
import escenaAbandono from '../assets/escena-abandono.png';
import escenaCancelacion from '../assets/escena-cancelacion.png';

const SPRITES = [personaje1, personaje2, personaje3];

export function spriteFor(character: Character): string {
  let hash = 0;
  for (const char of character.id) hash = (hash + char.charCodeAt(0)) % SPRITES.length;
  return SPRITES[hash];
}

export function levelSceneFor(level: Level): string {
  if (level >= 3) return escenaNivel3;
  if (level === 2) return escenaNivel2;
  return escenaNivel1;
}

export const ABANDONMENT_SCENE = escenaAbandono;
export const CANCELLATION_SCENE = escenaCancelacion;
