// Corazones flotantes de la celebración al completar misión (dirección-visual.md §3).
// 5-7 💕 nacen del sprite y suben (keyframe float-heart, ~600ms, stagger 60ms, deriva-X
// aleatoria ±20px vía --drift). CSS puro: cada corazón es un span absoluto con su propio
// delay y --drift. Se monta una sola vez (key del padre) y se desvanece solo.
//
// Asimetría 80/20: esto es SOLO celebración. La penalización NUNCA usa partículas.

import { useState } from 'react';

interface FloatingHeartsProps {
  // Cantidad de corazones (5-7 por defecto, aleatorio dentro de ese rango).
  count?: number;
}

// Deriva-X aleatoria ±20px (la "física ligera" del doc). Se calcula una vez al montar.
function makeHearts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    drift: `${Math.round((Math.random() * 2 - 1) * 20)}px`, // ±20px
    delay: `${i * 60}ms`, // stagger 60ms
    // Pequeño jitter horizontal de salida para que no nazcan todos del mismo píxel.
    left: `${50 + Math.round((Math.random() * 2 - 1) * 14)}%`,
  }));
}

export function FloatingHearts({ count }: FloatingHeartsProps) {
  // Initializer perezoso: la aleatoriedad (cantidad 5-7, deriva, jitter) se calcula UNA vez
  // al montar y queda congelada (las partículas no deben re-aleatorizarse en re-render).
  const [hearts] = useState(() => makeHearts(count ?? 5 + Math.floor(Math.random() * 3)));

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-visible"
    >
      {hearts.map((h) => (
        <span
          key={h.id}
          className="animate-float-heart absolute top-1/2 text-2xl"
          style={
            {
              left: h.left,
              animationDelay: h.delay,
              '--drift': h.drift,
            } as React.CSSProperties
          }
        >
          💕
        </span>
      ))}
    </div>
  );
}
