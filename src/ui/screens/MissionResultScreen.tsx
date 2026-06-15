// Resultado de completar una misión (motor de reactividad, P8-a, spec §5).
// Sucede DESPUÉS de completeMission, en el instante del "+X 💕". Surfacea, en este orden
// (convivencia P7-b: un solo Cupido por evento, primero el personaje, luego Cupido):
//   1. +X 💕 (ya existía como toast; aquí se muestra en grande con expresión feliz).
//   2. R3: línea extra de celebración del personaje cuando hay momentum (celebration).
//   3. A1: cuadro de Cupido (hito grande) o toast ligero (hito menor) cuando se cruzó un hito.
// Si no hay celebración ni hito, esta pantalla no se usa (App cae directo al Home con toast).

import type { Character } from '../../types';
import type { Celebration, MilestoneReaction } from '../../game/reaction';
import { PresenterDialog } from '../components/PresenterDialog';
import { Sprite } from '../components/Sprite';

interface MissionResultScreenProps {
  character: Character;
  heartsEarned: number;
  celebration: Celebration | null;
  milestone: MilestoneReaction | null;
  onAcknowledgeMilestone: (milestoneId: string) => void;
  onContinue: () => void;
}

export function MissionResultScreen({
  character,
  heartsEarned,
  celebration,
  milestone,
  onAcknowledgeMilestone,
  onContinue,
}: MissionResultScreenProps) {
  // A1: el cuadro de Cupido (modal) solo para hitos grandes. El menor se muestra como
  // toast ligero dentro de la misma confirmación (no interrumpe con modal).
  const showCupidoBox = milestone !== null && milestone.big;

  if (showCupidoBox && milestone) {
    // P7-b: el cuadro de Cupido del hito va al FINAL del evento; al reconocerlo, se persiste
    // (acknowledgeMilestone) y se cierra al Home.
    return (
      <PresenterDialog
        pose="corazon"
        cta="Continuar"
        onAdvance={() => {
          onAcknowledgeMilestone(milestone.id);
          onContinue();
        }}
      >
        <span className="block font-semibold text-pink-600">{milestone.cupidoLine}</span>
        <span className="mt-2 block italic text-stone-700">“{milestone.line}”</span>
      </PresenterDialog>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-pink-50 px-4 py-8 text-center">
      <Sprite character={character} size={128} />
      {/* +💕 solo cuando vino de completar una misión; un hito al abrir el Perfil no suma. */}
      {heartsEarned > 0 && (
        <h1 className="mt-4 text-2xl font-extrabold text-pink-600">+{heartsEarned} 💕</h1>
      )}
      <p className="mt-1 text-sm text-stone-500">{character.name}</p>

      {/* R3: línea extra de celebración del personaje (sin tocar corazones). */}
      {celebration && (
        <div className="mt-4 w-full max-w-sm rounded-xl border-2 border-pink-200 bg-white px-4 py-3">
          <p className="text-sm italic leading-relaxed text-stone-700">
            “{celebration.characterLine}”
          </p>
          {celebration.cupidoLine && (
            <p className="mt-1 text-xs text-pink-500">Cupido: {celebration.cupidoLine}</p>
          )}
        </div>
      )}

      {/* A1: hito menor como toast ligero dentro de la confirmación. */}
      {milestone && !milestone.big && (
        <div className="mt-3 w-full max-w-sm rounded-full bg-amber-100 px-4 py-2 text-xs font-medium text-amber-700">
          ✦ “{milestone.line}”
        </div>
      )}

      <button
        onClick={() => {
          if (milestone) onAcknowledgeMilestone(milestone.id);
          onContinue();
        }}
        className="mt-8 w-full max-w-xs rounded-xl bg-pink-500 px-4 py-3 font-bold text-white transition hover:bg-pink-600"
      >
        Continuar
      </button>
    </div>
  );
}
