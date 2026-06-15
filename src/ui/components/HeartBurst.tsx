// Burst radial de corazones para la celebración mayor (LevelScene), dirección-visual.md §3
// "Subir de nivel": ~14 corazones desde el CENTRO, stagger ~40ms, glow de celebración.
// La variante BODA sube intensidad: ~50% más partículas y mezcla 💍/💕.
//
// A diferencia de FloatingHearts (subida vertical desde el sprite), este burst es RADIAL:
// cada partícula sale del centro hacia un ángulo distinto (--angle) a una distancia (--distance)
// y se desvanece. CSS puro: la rotación/translación viven en el keyframe heart-burst.
//
// Asimetría 80/20: esto es SOLO celebración (el clímax del 80%). La pérdida nunca usa burst.

import { useState } from 'react';
import { makeBurst, BURST_COUNT_NORMAL, BURST_COUNT_WEDDING } from './heartBurst.helpers';

interface HeartBurstProps {
  wedding?: boolean;
}

export function HeartBurst({ wedding = false }: HeartBurstProps) {
  // Las partículas (cantidad fija + jitter) se congelan una sola vez al montar: no deben
  // re-aleatorizarse en re-render (regla de pureza del plugin react-hooks).
  const [particles] = useState(() =>
    makeBurst(wedding ? BURST_COUNT_WEDDING : BURST_COUNT_NORMAL, wedding),
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          // -translate centra el origen de cada partícula en el punto del burst.
          className="animate-heart-burst absolute -translate-x-1/2 -translate-y-1/2 text-2xl"
          style={
            {
              animationDelay: p.delay,
              '--angle': p.angle,
              '--distance': p.distance,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
