// Pantalla 6: Escena de abandono — tono oscuro, cierre real (flujo-pantallas.md).
// Dos variantes: el personaje se va (status abandoned, slot libre) o solo se
// distanció (bajó un nivel por inactividad, sigue en su slot).

import type { Character, GameState } from '../../types';
import { completedMissionsCount, daysTogether } from '../../game/engine';
import { Button } from '../components/Button';
import { CupidoMascot } from '../components/CupidoMascot';
import { ABANDONMENT_SCENE } from '../sprites';

interface AbandonmentSceneProps {
  state: GameState;
  character: Character;
  today: string;
  onClose: () => void;
}

export function AbandonmentScene({ state, character, today, onClose }: AbandonmentSceneProps) {
  const left = character.status === 'abandoned';
  const days = daysTogether(character, today);
  const completed = completedMissionsCount(state, character.id);
  const fewMissions = completed < 4;

  // Migrada a tokens (Ola 4, barrido de cohesión). Mantiene su fondo oscuro: es pérdida,
  // sobria, sin fiesta. --color-scene-abandon (el más oscuro), radios de token, y el aviso
  // de "bajó de nivel" en --color-risk (naranja = melancolía, NO rojo de error).
  return (
    <div className="flex min-h-svh flex-col items-center bg-scene-abandon px-4 py-6 text-center text-stone-200">
      <img
        src={ABANDONMENT_SCENE}
        alt="Escena de abandono"
        className="max-h-[50svh] w-full max-w-2xl rounded-card object-cover opacity-90"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
        {left ? (
          <p className="max-w-md text-lg">
            {fewMissions
              ? `"Apenas nos conocimos. Quizá no era el momento. Cuídate."`
              : `"Esperé 21 días. Creo que ambos sabemos cómo terminó esto. Cuídate."`}
          </p>
        ) : (
          <p className="max-w-md text-lg">
            "Sigues sin aparecer. Ya no me siento tan cerca de ti como antes…"
          </p>
        )}

        <div className="mt-2 text-sm text-stone-400">
          <p className="font-semibold text-stone-300">── Tu relación con {character.name} ──</p>
          <p>
            Duró {days} días · Completaste {completed} {completed === 1 ? 'misión' : 'misiones'}
          </p>
        </div>

        {left ? (
          <p className="text-sm text-stone-400">Esta habitación ahora está libre.</p>
        ) : (
          <p className="text-sm font-semibold text-risk">
            Bajó a Nivel {character.level}. Completa una misión pronto o se irá de verdad.
          </p>
        )}

        {/* Ola 6 (P4 / 80-20 INVIOLABLE): Cupido como consuelo digno, NO celebración. Entra
            SOBRIO (tone="loss": ease-in lento, sin spring de overshoot, SIN bob idle), pose
            'serena'. Cero confeti, cero festejo: es la pérdida. */}
        <CupidoMascot pose="serena" size={72} tone="loss" className="mt-2 opacity-90" />
      </div>

      {/* CTA sobrio de pérdida (§B 80/20): variant secondary, sin fiesta. */}
      <Button onClick={onClose} variant="secondary" className="mb-4 max-w-xs">
        {left ? 'Cerrar este capítulo' : 'Entendido'}
      </Button>
    </div>
  );
}
