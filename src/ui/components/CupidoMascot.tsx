// Cupido como mascota al frente — "Cupido es nuestro Duo" (Fase 4 Ola 6, P4 de §1, fila
// "Entrada de Cupido" de §3).
//
// Eleva a Cupido de LÍNEA DE TEXTO a SPRITE reactivo al frente. En un momento de CELEBRACIÓN,
// el sprite de Cupido (componente Cupido, pose acorde) ENTRA con un spring (stiffness 400,
// damping 16) + un "bob" idle suave (y: [0,-4,0], ~2s loop) mientras está presente, como Duo.
//
// Asimetría 80/20 (regla INVIOLABLE): en PÉRDIDA (AbandonmentScene) Cupido entra SOBRIO:
//   - tone="loss": entrada lenta con ease-in (sin spring de overshoot, damping alto), SIN bob
//     idle, sin festejo. Es el consuelo digno, no celebración.
//   - tone="celebration" (default): spring con overshoot + bob idle (la fiesta).
//
// prefers-reduced-motion (useReducedMotion de motion/react): sin spring NI bob — el sprite
// aparece quieto en su lugar, respetando el guard global.

import { motion, useReducedMotion } from 'motion/react';
import { Cupido, type CupidoPose } from './Cupido';

type CupidoTone = 'celebration' | 'loss';

interface CupidoMascotProps {
  pose: CupidoPose;
  size?: number;
  tone?: CupidoTone;
  className?: string;
}

// Entrada de celebración: spring con overshoot visible (la mascota "salta" al frente).
const CELEBRATION_SPRING = { type: 'spring', stiffness: 400, damping: 16 } as const;
// Entrada de pérdida: lenta, ease-in, SIN overshoot (damping conceptual alto = tween suave).
const LOSS_ENTER = { duration: 0.6, ease: 'easeIn' } as const;

export function CupidoMascot({
  pose,
  size = 96,
  tone = 'celebration',
  className = '',
}: CupidoMascotProps) {
  const reduced = useReducedMotion();
  const isLoss = tone === 'loss';

  // Con reduced-motion: el sprite aparece quieto (sin spring ni bob), respetando el guard.
  if (reduced) {
    return (
      <div className={className}>
        <Cupido pose={pose} size={size} />
      </div>
    );
  }

  // Bob idle: SOLO en celebración. En pérdida Cupido queda quieto (sin festejo).
  const idleAnimate = isLoss ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1, y: [0, -4, 0] };
  const idleTransition = isLoss
    ? undefined
    : {
        // El bob es un loop suave de ~2s; arranca DESPUÉS de que la entrada spring asiente.
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
      };

  return (
    <motion.div
      className={className}
      initial={isLoss ? { opacity: 0, y: 8 } : { scale: 0.6, opacity: 0 }}
      animate={idleAnimate}
      transition={isLoss ? LOSS_ENTER : { ...CELEBRATION_SPRING, ...idleTransition }}
    >
      <Cupido pose={pose} size={size} />
    </motion.div>
  );
}
