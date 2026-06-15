// Resultado de completar una misión (motor de reactividad, P8-a, spec §5).
// Sucede DESPUÉS de completeMission, en el instante del "+X 💕". Surfacea, en este orden
// (convivencia P7-b: un solo Cupido por evento, primero el personaje, luego Cupido):
//   1. +X 💕 (ya existía como toast; aquí se muestra en grande con expresión feliz).
//   2. R3: línea extra de celebración del personaje cuando hay momentum (celebration).
//   3. A1: cuadro de Cupido (hito grande) cuando se cruzó un hito grande.
//
// Fase 4 Ola 1.5 (juice en CADA complete): TODO complete que no sea subida de nivel pasa por
// aquí, así que el juice (sprite pop, corazones flotantes, conteo del +X, llenado de barra)
// corre SIEMPRE. Lo que cambia es si paramos al usuario o no:
//   - Si hay algo que LEER (celebración R3 o hito GRANDE → resultNeedsContinue): se muestra el
//     copy y el botón "Continuar" (el usuario lee y avanza), como antes.
//   - Si NO hay nada que leer (complete normal: ambos null) o el hito es MENOR: NO se muestra
//     caja de copy ni botón; la pantalla AUTO-AVANZA al terminar la secuencia (~2s, ~300ms en
//     prefers-reduced-motion). Un tap en cualquier parte salta el timer y avanza ya.
//
// Fase 4 Ola 1 (dirección-visual.md §3): aquí corre la secuencia de juice de celebración:
// sprite pop + corazones flotantes (del sprite), conteo animado del "+X 💕" y llenado +
// shimmer de la hearts bar. Asimetría 80/20: esto es SOLO la celebración (ruidosa).

import { useEffect, useRef } from 'react';
import type { Character } from '../../types';
import {
  resultNeedsContinue,
  type Celebration,
  type MilestoneReaction,
} from '../../game/reaction';
import { PresenterDialog } from '../components/PresenterDialog';
import { ReactiveBubble } from '../components/ReactiveBubble';
import { CupidoMascot } from '../components/CupidoMascot';
import { Button } from '../components/Button';
import { Sprite } from '../components/Sprite';
import { HeartsBar } from '../components/HeartsBar';
import { FloatingHearts } from '../components/FloatingHearts';
import { useCountUp } from '../hooks/useCountUp';

interface MissionResultScreenProps {
  character: Character;
  heartsEarned: number;
  celebration: Celebration | null;
  milestone: MilestoneReaction | null;
  onAcknowledgeMilestone: (milestoneId: string) => void;
  onContinue: () => void;
}

// Tiempo que dura la secuencia de juice antes de auto-avanzar (sin nada que leer).
const AUTO_ADVANCE_MS = 2000;
// En prefers-reduced-motion no hay juice que ver: avanza casi de inmediato.
const AUTO_ADVANCE_REDUCED_MS = 300;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function MissionResultScreen({
  character,
  heartsEarned,
  celebration,
  milestone,
  onAcknowledgeMilestone,
  onContinue,
}: MissionResultScreenProps) {
  // ¿Hay algo que leer (celebración o hito grande)? Si no, la pantalla auto-avanza.
  const needsContinue = resultNeedsContinue(celebration, milestone);
  // El cuadro de Cupido (modal) solo para hitos grandes.
  const showCupidoBox = milestone !== null && milestone.big;

  // Conteo animado del "+X 💕". El character ya trae el heartsTotal DESPUÉS de la misión;
  // el "antes" es heartsTotal - heartsEarned (lo que pinta el llenado de la barra).
  const earned = useCountUp(0, heartsEarned, 800);
  const heartsBefore = Math.max(0, character.heartsTotal - heartsEarned);

  // Guarda los callbacks/datos más recientes en UN ref, actualizado en un efecto (no en
  // render: la regla react-hooks/refs lo prohíbe). Así el efecto de auto-avance puede leer
  // siempre lo último SIN depender de ellos, y no se re-arma el timer en cada render.
  const latestRef = useRef({ onContinue, onAcknowledgeMilestone, milestone, advanced: false });
  useEffect(() => {
    latestRef.current.onContinue = onContinue;
    latestRef.current.onAcknowledgeMilestone = onAcknowledgeMilestone;
    latestRef.current.milestone = milestone;
  }, [onContinue, onAcknowledgeMilestone, milestone]);

  // Reconoce el hito (si lo hay) y avanza una sola vez (guard contra timer + tap juntos).
  function advance() {
    const l = latestRef.current;
    if (l.advanced) return;
    l.advanced = true;
    if (l.milestone) l.onAcknowledgeMilestone(l.milestone.id);
    l.onContinue();
  }

  // Auto-avance SOLO cuando no hay nada que leer. Timer con cleanup (clearTimeout). No corre
  // cuando needsContinue (en ese caso el usuario avanza con el botón / el cuadro de Cupido).
  useEffect(() => {
    if (needsContinue) return;
    const delay = prefersReducedMotion() ? AUTO_ADVANCE_REDUCED_MS : AUTO_ADVANCE_MS;
    const timer = setTimeout(advance, delay);
    return () => clearTimeout(timer);
    // advance es estable (solo lee/escribe latestRef); needsContinue no cambia tras montar.
  }, [needsContinue]);

  if (showCupidoBox && milestone) {
    // P7-b: el cuadro de Cupido del hito va al FINAL del evento; al reconocerlo, se persiste
    // (acknowledgeMilestone) y se cierra. (advance hace ambos.)
    return (
      <PresenterDialog pose="corazon" cta="Continuar" onAdvance={advance}>
        {/* Ola 6 (P4): Cupido al frente como Duo, su sprite reacciona (pose 'corazon',
            celebrando con spring + bob) sobre su línea de hito. */}
        <CupidoMascot pose="corazon" size={84} className="mx-auto mb-3" />
        <span className="block font-semibold text-pink-600">{milestone.cupidoLine}</span>
        <span className="mt-2 block italic text-stone-700">“{milestone.line}”</span>
      </PresenterDialog>
    );
  }

  return (
    <div
      // Cuando auto-avanza, un tap en cualquier parte salta el timer y avanza ya. Cuando hay
      // botón "Continuar", el tap del fondo no hace nada (el botón es la acción explícita).
      onClick={needsContinue ? undefined : advance}
      className="flex min-h-svh flex-col items-center justify-center bg-bg px-4 py-8 text-center"
    >
      {/* Sprite con "pop" + corazones flotantes que nacen de él (celebración). */}
      <div className="relative">
        {/* key fuerza el remontaje del pop al entrar a la pantalla. */}
        <div key={character.id} className="animate-happy-pop">
          <Sprite character={character} size={128} />
        </div>
        {heartsEarned > 0 && <FloatingHearts />}
      </div>

      {/* +💕 solo cuando vino de completar una misión; un hito al abrir el Perfil no suma. */}
      {heartsEarned > 0 && (
        <h1 className="mt-4 font-display text-3xl font-extrabold text-love">+{earned} 💕</h1>
      )}
      <p className="mt-1 text-sm text-ink-soft">{character.name}</p>

      {/* Hearts bar: se llena desde el valor de antes, cuenta y hace shimmer al terminar. */}
      {heartsEarned > 0 && (
        <div className="mt-4 w-full max-w-xs">
          <HeartsBar character={character} animateFromHearts={heartsBefore} />
        </div>
      )}

      {/* R3: celebración del personaje. Ola 6 (P4): cuando Cupido tiene línea, su SPRITE entra
          al frente como Duo (pose 'celebrar', spring + bob idle) sobre el bocadillo, que sigue
          con su carita reaccionando. Sin línea de Cupido, solo el bocadillo del personaje. */}
      {celebration && (
        <>
          {celebration.cupidoLine && (
            <CupidoMascot pose="celebrar" size={88} className="mt-5" />
          )}
          <ReactiveBubble
            characterLine={celebration.characterLine}
            cupidoLine={celebration.cupidoLine}
            className="mt-3 w-full max-w-sm"
          />
        </>
      )}

      {/* A1: hito menor como pill ligera SOLO si coexiste con algo que se lee (celebración):
          en ese caso hay botón "Continuar" y el hito menor viaja como pill para no perderlo.
          En el caso de auto-avance, el hito menor se muestra como toast al volver al Home. */}
      {needsContinue && milestone && !milestone.big && (
        <div className="mt-3 w-full max-w-sm rounded-full bg-amber-100 px-4 py-2 text-xs font-medium text-amber-700">
          ✦ “{milestone.line}”
        </div>
      )}

      {/* Botón "Continuar" solo cuando hay algo que leer. Sin él, la pantalla auto-avanza. */}
      {needsContinue && (
        <Button onClick={advance} className="mt-8 max-w-xs">
          Continuar
        </Button>
      )}
    </div>
  );
}
