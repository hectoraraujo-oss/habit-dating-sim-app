// useCountUp — conteo numérico animado con requestAnimationFrame (dirección-visual.md §3).
// Anima un número de `from` a `to` en `durationMs`. Se usa en la secuencia de completar
// misión para el "+X 💕" y/o el número de la hearts bar.
//
// Accesibilidad: en prefers-reduced-motion (o duración 0) NO anima — devuelve `to` directo.
// (El guard CSS global colapsa las animaciones a 1ms; el conteo, que es JS, hace el
// equivalente aquí.)
//
// La matemática del paso vive en `countUpValue` (función pura, testeable sin DOM ni rAF).

import { useEffect, useRef, useState } from 'react';

// Easing equivalente a --ease-out-soft para el conteo (mismo "feel" de llenado de barra).
function easeOutSoft(t: number): number {
  // cubic-bezier(0.22, 1, 0.36, 1) aproximado con un ease-out cúbico (rápido al inicio,
  // se asienta al final). Suficiente para un conteo numérico; el bezier exacto vive en CSS.
  return 1 - Math.pow(1 - t, 3);
}

// Valor del conteo en un progreso [0..1] del tiempo. Pura: el redondeo asegura enteros
// (corazones) y que el último frame (progress 1) caiga EXACTO en `to`.
export function countUpValue(from: number, to: number, progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  if (clamped >= 1) return to;
  return Math.round(from + (to - from) * easeOutSoft(clamped));
}

// ¿El usuario pidió reducir el movimiento? Guardado contra entornos sin window (tests/SSR).
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ¿Debe saltar la animación? (reduced-motion, duración 0, sin cambio, o sin rAF disponible).
function shouldSkip(from: number, to: number, durationMs: number): boolean {
  return (
    prefersReducedMotion() ||
    durationMs <= 0 ||
    from === to ||
    typeof requestAnimationFrame !== 'function'
  );
}

export function useCountUp(from: number, to: number, durationMs = 800): number {
  // Estado inicial correcto SIN setState en el efecto: si se salta la animación, nace en `to`.
  const [value, setValue] = useState(() => (shouldSkip(from, to, durationMs) ? to : from));
  // Guarda el `from` con el que arrancó esta animación para no reiniciar en cada render.
  const fromRef = useRef(from);

  useEffect(() => {
    // Sin animación: el valor ya nació en `to` (initializer); nada que hacer en el efecto.
    if (shouldSkip(from, to, durationMs)) return;

    fromRef.current = from;
    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = (now - start) / durationMs;
      setValue(countUpValue(fromRef.current, to, progress));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs]);

  return value;
}
